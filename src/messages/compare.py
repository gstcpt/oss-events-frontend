import json
import os
from pathlib import Path

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_keys(obj, parent_key=''):
    keys = set()
    if isinstance(obj, dict):
        for key, value in obj.items():
            full_key = f"{parent_key}.{key}" if parent_key else key
            keys.add(full_key)
            if isinstance(value, dict):
                keys.update(get_all_keys(value, full_key))
    return keys

def find_missing_keys(en_keys, target_keys, target_name):
    missing = en_keys - target_keys
    return missing

def find_extra_keys(en_keys, target_keys, target_name):
    extra = target_keys - en_keys
    return extra

def main():
    base_path = Path(r"E:\Ahmed\Backup\OSS-Events\frontend\src\messages")
    
    en_file = base_path / "en.json"
    fr_file = base_path / "fr.json"
    ar_file = base_path / "ar.json"
    
    print("Loading JSON files...")
    en_data = load_json(en_file)
    fr_data = load_json(fr_file)
    ar_data = load_json(ar_file)
    
    print("Extracting keys...")
    en_keys = get_all_keys(en_data)
    fr_keys = get_all_keys(fr_data)
    ar_keys = get_all_keys(ar_data)
    
    print(f"\nTotal keys:")
    print(f"  EN: {len(en_keys)}")
    print(f"  FR: {len(fr_keys)}")
    print(f"  AR: {len(ar_keys)}")
    
    # Find missing keys in FR
    fr_missing = find_missing_keys(en_keys, fr_keys, "FR")
    print(f"\nMissing in FR: {len(fr_missing)}")
    for key in sorted(fr_missing):
        print(f"  - {key}")
    
    # Find missing keys in AR
    ar_missing = find_missing_keys(en_keys, ar_keys, "AR")
    print(f"\nMissing in AR: {len(ar_missing)}")
    for key in sorted(ar_missing):
        print(f"  - {key}")
    
    # Find extra keys in FR (not in EN)
    fr_extra = find_extra_keys(en_keys, fr_keys, "FR")
    print(f"\nExtra in FR (not in EN): {len(fr_extra)}")
    for key in sorted(fr_extra):
        print(f"  - {key}")
    
    # Find extra keys in AR (not in EN)
    ar_extra = find_extra_keys(en_keys, ar_keys, "AR")
    print(f"\nExtra in AR (not in EN): {len(ar_extra)}")
    for key in sorted(ar_extra):
        print(f"  - {key}")
    
    # Generate fix suggestions
    print("\n" + "="*60)
    print("FIX SUGGESTIONS")
    print("="*60)
    
    if fr_missing:
        print("\n# Add to FR.json (copy values from EN):")
        print("Paste these keys after the appropriate section in fr.json:")
        for key in sorted(fr_missing):
            en_value = en_data
            for k in key.split('.'):
                en_value = en_value.get(k, {})
            print(f'            "{key.split(".")[-1]}": "{en_value if isinstance(en_value, str) else ""}",')
    
    if ar_missing:
        print("\n# Add to AR.json (copy values from EN):")
        print("Paste these keys after the appropriate section in ar.json:")
        for key in sorted(ar_missing):
            en_value = en_data
            for k in key.split('.'):
                en_value = en_value.get(k, {})
            print(f'            "{key.split(".")[-1]}": "{en_value if isinstance(en_value, str) else ""}",')

if __name__ == "__main__":
    main()