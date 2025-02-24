# Rollomancer

## A dice rolling application for role-playing games

Rollomancer is an application that allows you to enter a variety of complex
dice rolling formulas that you might encounter in role-playing games. You can
roll the dice, see a history of your rolls (and re-roll them), and add commonly
used formulas to a favourites list.

Rollomancer tells you what the expected average for your formula was and will
also tell you what half of the result is (rounded up and down) - suitable for
calculating save-for-half type damage effects.

Formulas can handle both addition and subtraction, (1d10 + 1, 1d8 - 2, etc.),
and can include multiple different types of dice (1d8 + 4d6 + 1). For each dice
group rolled, you see the individual rolls for each di, plus the total for each
group and a grand total. Advantage/Disadvantage mechanics are also handled using
the syntax `>2d20 + 1` (roll two twenty sided dice, take the best one, and then
add 1) and `<3d20 + 2` (roll three twenty sided dice, take the lowest and add
2).

Additionally, using the 'Stats' button, you can see several statistics about
the formula including a histogram of expected results.

Favourites and Roll History are stored in browser-local storage, so your values
will always persist if you are using the same browser.

This application was built mostly as a way to experiment with using AI to build
simple applications. It uses React and Typescript.
