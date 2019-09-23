# Translation tools

There are two python scripts to help to translate the string.json file, updateStrings<span></span>.py and checkStrings<span></span>.py.

## updateStrings.py

```shell
python updateStrings.py <locale>
```

This script read the strings.json and strings.\<locale\>.json, and output update.\<locale\>.json, putting the keys in the same order as those in strings.json. This don't write the keys that are not in strings.json in the output (show as deleted keys count in the shell), and add a 'TRANS:' in the start of every value which key is in strings.json but not in strings.\<locale\>.json

## checkStrings.py

```shell
python checkStrings.py <locale>
```
This script read the strings.json and string.\<locale\>.json and output every line that:
- is out of json format
- the number of periods (.) in the strings.json differ from strings.\<locale\>.json. The translation not need to have the same number of dots, but this help find phrase that end with periods but is forget in the translation
- the number of leading spaces (spaces before the first character) in the strings.json differ from strings.\<locale\>.json
- the number of tokens (like %0) in the strings.json differ from strings.\<locale\>.json.