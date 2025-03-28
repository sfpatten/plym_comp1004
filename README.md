# H.E.A.R.T - The Highly Expendable Android Recovery Team
By Sylenyx Patten, Developed in 2024-2025

## The mission
Pull off the perfect heist – in space!
Blast off to the station, fight your way to the secure vault, defeat the guard, and make your daring escape.
The mission is perilous, but you’re not alone. In fact, you’re not going at all.
Instead, we have H.E.A.R.T: the Highly Expendable Android Recovery Team – rather than risking your own life, risk the lives of the five hastily-constructed robots.
Each robot is personalised with its own dream and favourite food.
Sacrifices must be made for the Company, after all.

## How to play
You have five robots.
Avoid letting them take damage by moving them with the arrow or WASD keys.
If you do take damage, eat food to heal. Robots will heal more from eating their favourite food.
Fulfil your robot's dream to benefit the team.
Once a robot's HP reaches 0, it is destroyed. If you lose all five of your robots, the game is over.

## System requirements
Apart from my old laptop which periodically crashes due to a hardware issue, I could not find a system this game could not run on. However, I have not implemented mobile controls.
On Google Chrome on Windows, the most memory-hungry software combination I could procure, at its peak, it did not take more than 40MB of RAM, or 1.1% of the Intel i5 processor. This excludes the resources the browser itself needed,
Save files are between 2 and 4 KB in size. The game files themselves are under half a megabyte in size. It does not access files apart from on saving and loading screens, either so a slow disk should not be an issue.
Suffice to say, any computer in decent repair should be able to run this without issue.

## Development
This project was primarily developed on my Linux (Debian) laptop until it broke in late March, resulting in a change of setup in the final stages of the project.
Fortunately, I had a backup I had made earlier that day on a USB stick, so I lost very little work. I turned this backup into a Git repository and used an assortment of University computers to finish development on, and an old mostly non-functional laptop to run Git on for version control and backing it up to the cloud.

### Code editing
Initially I used the open-source text editor Kate on my Linux laptop. Later I activated a license for the JetBrains WebStorm IDE.
After my laptop broke, I used Notepad++ or Notepad on University computers to edit code.

### Testing
I ran and tested the game on the following browsers:
- Mozilla Firefox - on Linux and Windows
- Google Chrome - on Windows
- Microsoft Edge - on Windows
In each, I used the built-in console to perform any tests, activating debug functions and reading console output.

### Version control
Due to there being no official version of GitHub Desktop for Linux, I used Git on the command line for the duration of the project. Although WebStorm had a Git frontend, I did not investigate how to use it and continued to use the command line.
Commit timings were lost when I attempted to amend my username, which can be seen in earlier commits all listed at the same date.
You can observe a mixture of commits from my GitHub account and from a dummy account with my name due to not re-attempting to configure this on the repo for fear of losing more data.