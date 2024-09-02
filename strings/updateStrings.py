import json
from os import path
from shutil import copyfile
from sys import argv


def main() -> None:
    if len(argv) < 2:
        print("Please provide the locale key. Usage: python updateString.py <locale>")
        return

    locale = argv[1]

    if not path.exists(f"strings.{locale}.json"):
        print(
            f"File 'strings.{locale}.json' not found. Please create this file with '{{}}' as its content if it doesn't exist."
        )
        return

    try:
        with open("strings.json", encoding="utf-8") as default_file, open(
            f"strings.{locale}.json", "r+", encoding="utf-8"
        ) as locale_file:
            default_strings = json.load(default_file)
            locale_strings = json.load(locale_file)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return

    last_strings = None
    if path.exists("last-strings.json"):
        try:
            with open("last-strings.json", encoding="utf-8") as last_file:
                last_strings = json.load(last_file)
        except json.JSONDecodeError:
            print("The file 'last-strings.json' contains malformed JSON.")

    updated_strings = {}
    trans_count = 0
    change_count = 0

    for key, value in default_strings.items():
        if key in locale_strings:
            if locale_strings[key].startswith("TRANS:"):
                updated_strings[key] = "TRANS:" + value
                trans_count += 1
            elif last_strings and key in last_strings and value != last_strings[key]:
                updated_strings[key] = (
                    f"CHANGE:{locale_strings[key]}~FROM:{last_strings[key]}~TO:{value}"
                )
                change_count += 1
            else:
                updated_strings[key] = locale_strings[key]
            del locale_strings[key]
        else:
            updated_strings[key] = "TRANS:" + value
            trans_count += 1

    print(f"{change_count} {"value is" if change_count == 1 else "values are"} marked with tag 'CHANGE:'")
    print(f"{trans_count} {"value is" if trans_count == 1 else "values are"} marked with tag 'TRANS:'")
    if locale_strings:
        print(f"{len(locale_strings)} {"key was" if len(locale_strings) == 1 else "keys were"} deleted:")
        for key in locale_strings:
            print(key)
    else:
        print("No keys were deleted.")

    with open(f"strings.{locale}.json", "w", encoding="utf-8") as locale_file:
        json.dump(updated_strings, locale_file, ensure_ascii=False, indent=2)

    copyfile("strings.json", "last-strings.json")


if __name__ == "__main__":
    main()
