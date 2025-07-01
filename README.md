# Chibi Web Animation
<hr>
A fun, interactive web-based chibi character that animates, reacts to your mouse, and displays a variety of behaviors and states!
<hr>
<h2>Features</h2>
<hr>
- **Idle & Jump Animation:** Chibi alternates between idle and jump when the mouse is active.
- **Chase & Escape:** If you chase the chibi with your cursor, it runs away in the opposite direction, with movement speed based on your mouse speed.
- **Attack Animation:** When escaping, the chibi performs a random attack animation facing the cursor.
- **Teleportation:** If the chibi reaches the edge of the window, it teleports to a random location.
- **Catch & Hurt:** If you catch the chibi (cursor overlaps the chibi), it plays a hurt animation and resets to the center.
- **Sleep State:** If the mouse is inactive for 5 seconds or leaves the window, the chibi plays a sleep sequence (Idle → Tosleep → Sleeping). On return, it wakes up and resumes normal behavior.
- **Responsive & Pixel-Perfect:** Works with pixel-art spritesheets and is fully responsive.
<hr>
<h2>Folder Structure</h2>
<hr>
```
chibi-web/
  index.html
  styles.css
  script.js
  sprites/
    Attack_1.png
    Attack_2.png
    Attack_3.png
    Attack_4.png
    Hurt.png
    Idle.png
    Jump.png
    Run.png
    Sleeping.png
    Tosleep.png
    Wakeup.png
    Walk.png
```
<hr>
Feel free to copy, modify, and use this README for your GitHub project!
<hr>
