# Translation tools

There are two python scripts to help to translate the string.json file, updateStrings<span></span>.py and checkStrings<span></span>.py.

## updateStrings.py

```shell
python updateStrings.py <locale>
```

This script read the strings.json and strings.\<locale\>.json, and overwrite its contents, putting the keys in the same order as those in strings.json. This don't write the keys that are not in strings.json in the output (show as deleted keys count in the shell), and add a 'TRANS:' in the start of every value which key is in strings.json but not in strings.\<locale\>.json. Avoid trouble using git.

## checkStrings.py

```shell
python checkStrings.py <locale>
```
This script read the strings.json and string.\<locale\>.json and output every line that:
- is out of json format
- the number of periods (.) in the strings.json differ from strings.\<locale\>.json. The translation not need to have the same number of periods, but this help find phrases that end with periods but is forget in the translation
- the number of leading spaces (spaces before the first character) in the strings.json differ from strings.\<locale\>.json
- the number of tokens (like %0) in the strings.json differ from strings.\<locale\>.json
- the numbers in the strings.json differ from strings.\<locale\>.json

You can disable some of the checks if you open the script and change the values (to ```True``` or ```False```):
```python
check_tokens = True
check_leading_space = True
check_periods = True
check_numbers = True
```