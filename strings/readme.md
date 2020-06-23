# Translation tools

There are two python scripts to help to translate the strings.json file: updateStrings<span></span>.py and checkStrings<span></span>.py.

## updateStrings.py

```shell
python updateStrings.py <locale>
```

This script reads the strings.json and strings.\<locale\>.json, and overwrite its contents, putting the keys in the same order as those in strings.json. This doesn't write the keys that are not in strings.json in the output (show as deleted keys count in the shell), and add a 'TRANS:' in the start of every value which key is in strings.json but not was in strings.\<locale\>.json.

If there is a last-strings.json file, it will be used to keep track of changes in keys values, which will be format as 'CHANGE:\<previous translation\>~FROM:\<last string\>~TO:\<string\>'. In the end of the operation, the strings.json contents will be again copied to last-strings.json.

## checkStrings.py

```shell
python checkStrings.py <locale>
```
This script reads the strings.json and string.\<locale\>.json files and outputs every line that:
- is out of json format
- the value is marked with tag 'TRANS:' or 'CHANGE:'
- the number of periods (.) in the strings.json differs from strings.\<locale\>.json. The translation does not need to have the same number of periods, but this helps find phrases that end with periods that were forgotten in the translation
- the number of leading spaces (spaces before the first character) in the strings.json differs from strings.\<locale\>.json
- the number of tokens (like %0) in the strings.json differs from strings.\<locale\>.json
- the numbers in the strings.json differ from strings.\<locale\>.json

You can disable some of the checks if you open the script and change the values to ```True``` or ```False```:
```python
check_tags = True
check_tokens = True
check_leading_space = True
check_periods = True
check_numbers = True
```
