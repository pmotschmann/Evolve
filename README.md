# Evolve

## Play

https://pmotschmann.github.io/Evolve/

## About

An incremental game about evolving a civilization from primordial ooze into a space faring empire.
Evolve combines elements of a clicker with an idler and has lots of micromanagement.

What will you evolve into?

## Submitting Issues
If you think you have discovered a bug or have some other issue with the game then you can open an issue here on Github.
Please do not open Github issues to ask gameplay questions, use Reddit or Discord for that.
Links for both can be found in the footer of the game.

## Contributing a Language file
If you are interested in a contributing a new language for Evolve the process is fairly straight forward (although a bit tedious).

Make a copy of strings/strings.json and name the copy as strings/strings.\<locale\>.json (EX: strings.es_US.json). The locale format is the language alpha-2 code joined with the country alpha-2 code.

The strings are stored in a json format and will look like this:
```
"job_farmer_desc": "Farmers create food to feed your population. Each farmer generates %0 food per second.",
```
If you are unfamiliar with json the first part is a **key** and cannot be altered, **do not translate or modify the key in any way**. The second part is the string to be translated. Many game strings use **tokens** (**%0**, **%1**, **%2**, etc) to represent game values, as such these tokens must remain in the final translated string. Their position can be moved accordingly, the number represents a specific value and not its position in the string.

To enable your language translation in the game you must add it to the locales constant in locale.js (bottom of the file).

Once you feel your translation file is ready send a pull request with it to the Evolve main branch.


## Contributing to the game
Bug fixes, additional translations, themes, or UI improvements can simply be submitted as pull requests; once reviewed and accepted they will be merged into the main game branch. If you want to contribute a new feature it can not arbitrarily make something easier without making something else harder. If your new feature idea simply makes the game easier it will not be accepted.

## CSS Changes
Evolve uses LESS to build its CSS, you can not just edit the minified CSS file. You must instead edit src/evolve.less then use the less compiler to rebuild the CSS file.

## Build Commands
Assuming you configured your build environment correctly the game can be built using the following scripts
```
npm run build // Builds the game bundle
npm run dev // Builds the game bundle in debug mode
npm run less // Builds the CSS file
npm run wiki // Builds the wiki bundle
npm run wiki-dev // Builds the wiki bundle in debug mode
npm run wiki-less // Builds the Wiki CSS file
```
