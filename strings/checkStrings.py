import json
import sys
import os.path as path
import re

print()

check_tags = True
check_tokens = True
check_leading_space = True
check_periods = True
check_numbers = True

def led_spaces(str):
    return len(str) - len(str.lstrip(' '))

if len(sys.argv) < 2:
    print("inform locale key (example 'python checkString.py pt-BR')")
else:
    locale = sys.argv[1]

    if not path.isfile('strings.{}.json'.format(locale)):
        print("'strings.{}.json' not found. Create it before calling this script.".format(locale))
        exit()

    with open('strings.json', encoding='utf-8') as default_file, \
        open('strings.{}.json'.format(locale), encoding='utf-8') as loc_file:
        defstr = json.load(default_file)
        
        json_regex = re.compile(r'"(?P<key>.+)"\s*:\s"(?P<value>.*)"\s*$')
        period_count = re.compile(r'(\.(\D|$))|。')
        tokens_regex = re.compile(r'%\d+(?!\d)')
        numbers_regex = re.compile(r'\d+')

        for (nl, line) in enumerate(loc_file):
            line = line.strip()
            if line == '{' or line == '}' or len(line) == 0:
                continue

            if line[-1] == ',':
                line = line[:-1]
            
            line = re.search(json_regex, line)

            if line == None:
                print('failed parse line {}'.format(nl+1))
            line = line.groupdict()

            if not line['key'] in defstr:
                print("key '{}' is not found in string.json, from line {}".format(line['key'], nl))
                continue
            else:
                defline = defstr[line['key']]

            if check_tags:
                if line['value'][0:6] == "TRANS:":
                    print("key '{}' is marked with tag 'TRANS:', from line {}".format(line['key'], nl))
                if line['value'][0:7] == "CHANGE:":
                    print("key '{}' is marked with tag 'CHANGE:', from line {}".format(line['key'], nl))
            
            if check_tokens:
                tcdef = len(tokens_regex.findall(defline))
                tcloc = len(tokens_regex.findall(line['value']))
                if tcdef != tcloc:
                    print("Number of tokens (like %0) number differ (def: {} != loc: {}), in key '{}', line {}" \
                        .format(tcdef, tcloc, line['key'], nl+1))

            if check_leading_space:
                leddef = led_spaces(defline)
                ledloc = led_spaces(line['value'])
                if leddef != ledloc:
                    print("leading spaces differ (def: {} != loc: {}), in key '{}', line {}".format(leddef, ledloc, line['key'], nl+1))
            
            if check_periods:            
                pcdef = len(period_count.findall(defline))
                pcloc = len(period_count.findall(line['value']))
                if pcdef != pcloc:
                    print("periods number differ (def: {} != loc: {}), in key '{}', line {}" \
                        .format(pcdef, pcloc, line['key'], nl+1))
            
            if check_numbers:
                pcdef = numbers_regex.findall(defline)
                pcloc = numbers_regex.findall(line['value'])
                if sorted(pcdef) != sorted(pcloc):
                    print("Numbers differ (def: {} != loc: {}), in key '{}', line {}" \
                        .format(pcdef, pcloc, line['key'], nl+1))