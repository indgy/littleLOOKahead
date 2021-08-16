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

