import json
from os import path
import re
from sys import argv


def main() -> None:
    """
    Checks localization strings for consistency with the default strings.

    This script performs various checks on localized JSON string files to ensure they match the default strings.
    The checks include the presence of specific tags (e.g., TRANS:, CHANGE:), consistency in the number of tokens (e.g., %1, %2), matching leading spaces, consistency in the number of periods, and matching numerical values.

    Usage:
        python updateString.py <locale>
    """

    check_tags = True
    check_tokens = True
    check_leading_spaces = True
    check_periods = True
    check_numbers = True

    if len(argv) < 2:
        print("Please provide the locale key. Usage: python updateString.py <locale>")
        return

    locale = argv[1]

    if not path.exists(f"strings.{locale}.json"):
        print(
            f"File 'strings.{locale}.json' not found. Please create this file with '{{}}' as its content if it doesn't exist."
        )
        return

    with open("strings.json", encoding="utf-8") as default_file, open(
        f"strings.{locale}.json", encoding="utf-8"
    ) as localized_file:
        default_strings = json.load(default_file)

        json_pattern = re.compile(r'"(?P<key>.+)"\s*:\s"(?P<value>.*)"\s*$')
        period_pattern = re.compile(r"(\.(\D|$))|。")
        token_pattern = re.compile(r"%\d+(?!\d)")
        number_pattern = re.compile(r"\d+")

        for line_number, line in enumerate(localized_file):
            line = line.strip()
            if line in {"{", "}", ""}:
                continue

            if line.endswith(","):
                line = line[:-1]

            match = re.search(json_pattern, line)

            if match is None:
                print(f"Failed to parse line {line_number + 1}")
                continue

            line_dict = match.groupdict()

            if line_dict["key"] not in default_strings:
                print(
                    f"Key '{line_dict['key']}' not found in strings.json, from line {line_number}"
                )
                continue

            default_line = default_strings[line_dict["key"]]

            if check_tags and line_dict["value"].startswith(("TRANS:", "CHANGE:")):
                print(
                    f"Key '{line_dict['key']}' is marked with tag '{line_dict['value'].split(':')[0]}:', from line {line_number}"
                )

            if check_tokens:
                default_token_count = len(token_pattern.findall(default_line))
                localized_token_count = len(token_pattern.findall(line_dict["value"]))
                if default_token_count != localized_token_count:
                    print(
                        f"Number of tokens differ (default: {default_token_count} != localized: {localized_token_count}), in key '{line_dict['key']}', line {line_number + 1}"
                    )

            if check_leading_spaces:

                def _leading_spaces(s: str) -> int:
                    return len(s) - len(s.lstrip(" "))

                default_leading_spaces = _leading_spaces(default_line)
                localized_leading_spaces = _leading_spaces(line_dict["value"])
                if default_leading_spaces != localized_leading_spaces:
                    print(
                        f"Leading spaces differ (default: {default_leading_spaces} != localized: {localized_leading_spaces}), in key '{line_dict['key']}', line {line_number + 1}"
                    )

            if check_periods:
                default_period_count = len(period_pattern.findall(default_line))
                localized_period_count = len(period_pattern.findall(line_dict["value"]))
                if default_period_count != localized_period_count:
                    print(
                        f"Number of periods differ (default: {default_period_count} != localized: {localized_period_count}), in key '{line_dict['key']}', line {line_number + 1}"
                    )

            if check_numbers:
                default_numbers = sorted(number_pattern.findall(default_line))
                localized_numbers = sorted(number_pattern.findall(line_dict["value"]))
                if default_numbers != localized_numbers:
                    print(
                        f"Numbers differ (default: {default_numbers} != localized: {localized_numbers}), in key '{line_dict['key']}', line {line_number + 1}"
                    )


if __name__ == "__main__":
    main()
