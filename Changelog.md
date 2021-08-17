# Changelog
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.1.0] - 2021-08-16

First usable release, I am using this in development.

Moved all key detection code into two functions, inputKeyPressed() which handles
the input and itemKeyPressed() which handles the input-list-item keypresses.

Added right/left arrow key events to input-list-item which jumps back to the 
beginning or end of the input.

Fixed issue where Safari autocomplete would clear the input after receiving
search results.

## [0.1.0] - 2021-08-17

Added throttle to fetch() so that we're not blasting simultaneous requests.

Switched to custom debounce only for searchable input keys.

Added check that input is greater than min_chars before fetch().

Added option to not fetch() when deleting characters.

Added keybinding so that the items list disappears when entering the input.

Tidied up code using Prettier.