import gspread

# === Configuration ===
SHEET_ID = "1megV5iV3BObRDTqFp2Od-50Sedsv257jLnxziAA3dN0"  # <- remplace ça par l'ID de ton Google Sheet "1g_8ETAvX5H08vR7j2fCDwaVz_mK1IEh_3wFa8QrU1GE"
SERVICE_ACCOUNT_FILE = "Databases/mukanew-4a4f2dd7432c.json"
EXPORT_FILE = "Databases/micronutrients_clean.json"

def push_db(name, ean):
    """
    Append the (ean, name) pair to the 'Barcode' column of any matching row
    across all worksheets in the target Google Spreadsheet.

    A row is considered a match if the 'Complément Alimentaire' cell is contained
    in the provided 'name' (case-insensitive, trimmed).

    Notes:
        - Uses gspread with a service account JSON file.
        - Updates are performed in-place using ws.update_cell.

    Args:
        name: Product/supplement name (string to search within).
        ean: EAN/Barcode to append (as "ean,name" on a new line in the cell).
    """ 
    try:
        gc = gspread.service_account(filename=SERVICE_ACCOUNT_FILE)
        spreadsheet = gc.open_by_key(SHEET_ID)
        sheets = spreadsheet.worksheets()

        for ws in sheets:
            values = ws.get_all_values()
            if not values:
                continue

            headers = values[0]
            try:
                name_col = headers.index("Complément Alimentaire")
                barcode_col = headers.index("Barcode")
            except ValueError:
                continue  # Required columns not found
            print("before the for")
            for idx, row in enumerate(values[1:], start=2):  # gspread is 1-indexed
                if name_col >= len(row):
                    continue

                row_name = row[name_col].strip().lower()

                if row_name in name:
                    current_barcode = row[barcode_col] if barcode_col < len(row) else ""
                    barcode_lines = current_barcode.strip().split("\n") if current_barcode.strip() else []

                    already_present = any(ean in line for line in barcode_lines)
                    print("current_barcode")

                    if not already_present:
                        new_line = f"{ean},{name}"
                        new_value = current_barcode.strip() + ("\n" if current_barcode.strip() else "") + new_line
                        print("new value")
                        ws.update_cell(idx, barcode_col + 1, new_value)
                        print(f"[📤] Google Sheet mis à jour : {name} dans '{ws.title}' (ligne {idx})")

    except Exception as e:
        print(f"[❌] Erreur lors de la mise à jour de Google Sheets : {e}")