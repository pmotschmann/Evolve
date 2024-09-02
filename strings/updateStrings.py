import json
from shutil import copyfile
import sys
import os.path as path

print()

if len(sys.argv) < 2:
    print("inform locale key (python updateString.py <locale>)")
else:
    locale = sys.argv[1]

    if not path.isfile('strings.{}.json'.format(locale)):
        print("'strings.{}.json' not found.\nCreate that file with a line write '{{ }}' if need.".format(locale))
        exit()

    with open('strings.json', encoding='utf-8') as default_file, \
        open('strings.{}.json'.format(locale), 'r+', encoding='utf-8') as loc_file:#, \
        
        try:
            default_strings = json.load(default_file)
        except:
            print("the 'strings.json' file is a malformed json file.")
            exit()
        
        try:
            locale_strings = json.load(loc_file)
        except:
            print("the 'strings.{}.json' file is a malformed json file.".format(locale))
            exit()

        if path.isfile('last-strings.json'.format(locale)):
            last_file = open('last-strings.json', encoding='utf-8')
            try:
                last_strings = json.load(last_file)
            except:
                print("the last-strings.json was a malformed json file.")
                last_strings = None
            last_file.close();
        else:
            last_strings = None
        
        writing = {}

        trans_count = 0
        change_count = 0

        for key in default_strings:
            if key in locale_strings:
                if locale_strings[key][0:6] == "TRANS:":
                    writing[key] = "TRANS:" + default_strings[key]
                    trans_count+=1
                elif last_strings is not None and key in last_strings and default_strings[key] != last_strings[key]:
                    writing[key] = "CHANGE:" + locale_strings[key] + "~FROM:{}~TO:{}".format(last_strings[key], default_strings[key])
                    change_count+=1
                else:
                    writing[key] = locale_strings[key]
                del locale_strings[key]
            else:
                writing[key] = "TRANS:" + default_strings[key]
                trans_count+=1
        
        print("{} values are marked with tag 'CHANGE:'".format(change_count))
        print("{} values are marked with tag 'TRANS:'".format(trans_count))
        if len(locale_strings) > 0:
            print("{} keys was deleted: ".format(len(locale_strings)))
            for key in locale_strings:
                print(key)
        else:
            print("0 keys was deleted.".format(len(locale_strings)))
        
        loc_file.seek(0,0);
        loc_file.truncate(0);
        json.dump(writing, loc_file, ensure_ascii=False, indent=2)

        copyfile("strings.json", "last-strings.json");
