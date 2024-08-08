import json
from os import path
from shutil import copyfile
from sys import argv
from typing import Any, Dict


def main() -> None:
    print()

    if len(argv) < 2:
        print("inform locale key (python updateString.py <locale>)")
        return

    locale: str = argv[1]

    if not path.isfile(f"strings.{locale}.json"):
        print(
            f"'strings.{locale}.json' not found.\nCreate that file with a line write '{{ }}' if need."
        )
        return

    try:
        with open("strings.json", encoding="utf-8") as default_file:
            default_strings: Dict[str, Any] = json.load(default_file)
    except json.JSONDecodeError:
        print("the 'strings.json' file is a malformed json file.")
        return

    try:
        with open(f"strings.{locale}.json", "r+", encoding="utf-8") as loc_file:
            locale_strings: Dict[str, Any] = json.load(loc_file)
    except json.JSONDecodeError:
        print(f"the 'strings.{locale}.json' file is a malformed json file.")
        return

    last_strings: Dict[str, Any] | None = None
    if path.isfile("last-strings.json"):
        try:
            with open("last-strings.json", encoding="utf-8") as last_file:
                last_strings = json.load(last_file)
        except json.JSONDecodeError:
            print("the last-strings.json was a malformed json file.")

    writing: Dict[str, Any] = {}

    trans_count: int = 0
    change_count: int = 0

    for key in default_strings:
        if key in locale_strings:
            if locale_strings[key][:6] == "TRANS:":
                writing[key] = "TRANS:" + default_strings[key]
                trans_count += 1
            elif (
                last_strings is not None
                and key in last_strings
                and default_strings[key] != last_strings[key]
            ):
                writing[key] = (
                    f"CHANGE:{locale_strings[key]}~FROM:{last_strings[key]}~TO:{default_strings[key]}"
                )
                change_count += 1
            else:
                writing[key] = locale_strings[key]
            del locale_strings[key]
        else:
            writing[key] = "TRANS:" + default_strings[key]
            trans_count += 1

    print(f"{change_count} values are marked with tag 'CHANGE:'")
    print(f"{trans_count} values are marked with tag 'TRANS:'")
    if len(locale_strings) > 0:
        print(f"{len(locale_strings)} keys were deleted:")
        for key in locale_strings:
            print(key)
    else:
        print("0 keys were deleted.")

    with open(f"strings.{locale}.json", "w", encoding="utf-8") as loc_file:
        json.dump(writing, loc_file, ensure_ascii=False, indent=2)

    copyfile("strings.json", "last-strings.json")


if __name__ == "__main__":
    main()
