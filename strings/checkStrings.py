import json
from os import path
import re
from sys import argv
from typing import List


def main() -> None:
    print()

    check_tags: bool = True
    check_tokens: bool = True
    check_leading_space: bool = True
    check_periods: bool = True
    check_numbers: bool = True

    def led_spaces(s: str) -> int:
        return len(s) - len(s.lstrip(" "))

    if len(argv) < 2:
        print("inform locale key (example 'python checkString.py pt-BR')")
    else:
        locale: str = argv[1]

        if not path.isfile(f"strings.{locale}.json"):
            print(
                f"'strings.{locale}.json' not found. Create it before calling this script."
            )
            exit()

        with open("strings.json", encoding="utf-8") as default_file, open(
            f"strings.{locale}.json", encoding="utf-8"
        ) as loc_file:
            defstr: dict = json.load(default_file)

            json_regex = re.compile(r'"(?P<key>.+)"\s*:\s"(?P<value>.*)"\s*$')
            period_count = re.compile(r"(\.(\D|$))|。")
            tokens_regex = re.compile(r"%\d+(?!\d)")
            numbers_regex = re.compile(r"\d+")

            for nl, line in enumerate(loc_file):
                line = line.strip()
                if line == "{" or line == "}" or len(line) == 0:
                    continue

                if line[-1] == ",":
                    line = line[:-1]

                match: re.Match | None = re.search(json_regex, line)

                if match is None:
                    print(f"failed parse line {nl+1}")
                    continue
                line_dict = match.groupdict()

                if line_dict["key"] not in defstr:
                    print(
                        f"key '{line_dict['key']}' is not found in string.json, from line {nl}"
                    )
                    continue
                else:
                    defline: str = defstr[line_dict["key"]]

                if check_tags:
                    if line_dict["value"][0:6] == "TRANS:":
                        print(
                            f"key '{line_dict['key']}' is marked with tag 'TRANS:', from line {nl}"
                        )
                    if line_dict["value"][0:7] == "CHANGE:":
                        print(
                            f"key '{line_dict['key']}' is marked with tag 'CHANGE:', from line {nl}"
                        )

                if check_tokens:
                    tcdef: int = len(tokens_regex.findall(defline))
                    tcloc: int = len(tokens_regex.findall(line_dict["value"]))
                    if tcdef != tcloc:
                        print(
                            f"Number of tokens (like %0) number differ (def: {tcdef} != loc: {tcloc}), in key '{line_dict['key']}', line {nl+1}"
                        )

                if check_leading_space:
                    leddef: int = led_spaces(defline)
                    ledloc: int = led_spaces(line_dict["value"])
                    if leddef != ledloc:
                        print(
                            f"leading spaces differ (def: {leddef} != loc: {ledloc}), in key '{line_dict['key']}', line {nl+1}"
                        )

                if check_periods:
                    pcdef: int = len(period_count.findall(defline))
                    pcloc: int = len(period_count.findall(line_dict["value"]))
                    if pcdef != pcloc:
                        print(
                            f"periods number differ (def: {pcdef} != loc: {pcloc}), in key '{line_dict['key']}', line {nl+1}"
                        )

                if check_numbers:
                    ncdef: List[str] = numbers_regex.findall(defline)
                    ncloc: List[str] = numbers_regex.findall(line_dict["value"])
                    if sorted(ncdef) != sorted(ncloc):
                        print(
                            f"Numbers differ (def: {ncdef} != loc: {ncloc}), in key '{line_dict['key']}', line {nl+1}"
                        )


if __name__ == "__main__":
    main()
