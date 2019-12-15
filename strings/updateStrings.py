import json
import sys
import os.path as path

print()

if len(sys.argv) < 2:
    print("inform locale key (python updateString.py <locale>)")
else:
    locale = sys.argv[1]

    if not path.isfile('strings.{}.json'.format(locale)):
        print("'strings.{}.json' not found.".format(locale))
        exit()

    with open('strings.json', encoding='utf-8') as default_file, \
        open('strings.{}.json'.format(locale), 'r+', encoding='utf-8') as loc_file:#, \
        # open('update.{}.json'.format(locale), 'w', encoding='utf-8') as wr_file:
        defstr = json.load(default_file)
        locstr = json.load(loc_file)

        wr = {}

        trans_count = 0

        for key in defstr:
            if key in locstr:
                if locstr[key][0:7] == "TRANS:":
                    wr[key] = "TRANS:" + defstr[key]
                    trans_count+=1
                else:
                    wr[key] = locstr[key]
                del locstr[key]
            else:
                wr[key] = "TRANS:" + defstr[key]
                trans_count+=1
        
        print("{} values are marked with tag 'TRANS:'".format(trans_count))
        print("{} keys was deleted".format(len(locstr)))

        loc_file.seek(0,0);
        loc_file.truncate(0);
        json.dump(wr, loc_file, ensure_ascii=False, indent=2)