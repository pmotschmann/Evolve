# Evolve

## Play

https://pmotschmann.github.io/Evolve/

## About

An incremental game about evolving a civilization from primordial ooze into a space faring empire.
Evolve combines elements of a clicker with an idler and has lots of micromanagement.

What will you evolve into?


## Contributing a Language file
If you are interested in a contributing a new language for Evolve the process is fairly straight forward (although a bit tedious).

Make a copy of strings/strings.json and name the copy as strings/strings.\<locale\>.json (EX: strings.es_US.json). The locale format is the language alpha-2 code joined with the country alpha-2 code using an underscore.
  
The strings are stored in a json format and will look like this:
```
"job_farmer_desc": "Farmers create food to feed your population. Each farmer generates %0 food per second.",
```
If you are unfamilar with json the first part is a key and should not be altered, the second part is the string to be translated. Many game strings uses tokens (%0, %1, %2, etc) to represent game values, as such these tokens must remain in the finale translated string. Their position can be moved accordingly, the number represents a specific value and not its position in the string.

To enable your language translation in the game you must add it to the locales constant in locale.js (bottom of the file).

Once you feel your translation file is ready send a pull request with it to the Evolve main branch.
