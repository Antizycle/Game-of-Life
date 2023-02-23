# Game-of-Life
Game of life
just a simple implementation of Game of Life on pure javascript.
Classic rules, border transitions to other side (toroidal array).
You can gererate randomly filled field with chosen size or set cells manualy.
Then start evolution process with selected speed.

Field is rendered as a html table. Each cycle it is getting redrawn with new
set of cells. Cell data is stored in a 2d array which is getting cloned each 
cycle to be checked for next generation.

TODO:
- redraws of full field each cycle are a bit computation heavy and there is some margin
  for optimisations.
