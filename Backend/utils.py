import re  
import unicodedata

def normalize_text(s: str) -> str:
    """
    Lowercase, remove accents, collapse spaces, strip quotes/punct that hurt matching.
    Keeps useful chars like + / - & '.
    """
    if not s:
        return ""
    s = strip_accents(s).lower()
    # remove surrounding quotes and extra pipes spacing later
    s = s.replace('“', '"').replace('”', '"').replace('’', "'")
    # kill quotes but keep the letters
    s = s.replace('"', " ").replace("«", " ").replace("»", " ")
    # normalize all non-word-ish separators except allowed chars
    s = re.sub(r"[^a-z0-9+/&'\-\s|]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def parse_aliases(db_value: str) -> list[str]:
    """
    Split a DB field that may look like:  "name1" | "name2" | name3
    Returns a list of normalized aliases.
    """
    if not db_value:
        return []
    parts = [p.strip().strip('"').strip("'") for p in db_value.split("|")]
    return [normalize_text(p) for p in parts if p.strip()]

def name_matches(db_value: str, candidate_name: str) -> bool:
    """
    True if any alias from db_value is contained in candidate_name OR
    candidate_name is contained in the alias (covers short/long variants).
    """
    cand = normalize_text(candidate_name)
    if not cand:
        return False
    aliases = parse_aliases(db_value)
    return any(a and (a in cand or cand in a) for a in aliases)

def strip_accents(text):
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    ).lower()

def async_update(name, ean):
    update_barcode_in_sheet(name, ean)