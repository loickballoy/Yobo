import gspread

SHEET_ID = "1megV5iV3BObRDTqFp2Od-50Sedsv257jLnxziAA3dN0"  # <- remplace ça par l'ID de ton Google Sheet "1g_8ETAvX5H08vR7j2fCDwaVz_mK1IEh_3wFa8QrU1GE"
SERVICE_ACCOUNT_FILE = "Databases/mukanew-4a4f2dd7432c.json"
EXPORT_FILE = "Databases/micronutrients_clean.json"

def push_db(name, ean):
    try:
        gc = gspread.service_account(filename=SERVICE_ACCOUNT_FILE)
        spreadsheet = gc.open_by_key(SHEET_ID)
        sheets = spreadsheet.worksheets()

        for ws in sheets:
            values = ws.get_all_values()
            if not values:
                continue

            headers = values[0]
            print("befor")
            try:
                name_col = headers.index("Complément Alimentaire")
                barcode_col = headers.index("Barcode")
            except ValueError:
                continue  # Required columns not found
            print("before the other for")
            for idx, row in enumerate(values[1:], start=2):  # gspread is 1-indexed
                if name_col >= len(row):
                    continue

                row_name = row[name_col].strip().lower()

                if row_name in name:
                    current_barcode = row[barcode_col] if barcode_col < len(row) else ""
                    if not current_barcode.strip():
                        ws.update_cell(idx, barcode_col + 1, ean)
                        print(f"[📤] Google Sheet mis à jour : {name} dans '{ws.title}' (ligne {idx})")

    except Exception as e:
        print(f"[❌] Erreur lors de la mise à jour de Google Sheets : {e}")