/* Academy lessons: Grade 4 Math (js/syllabus.js g4.math). Format: academy/js/lessons.js. */
AcademyLessons.add("g4-math", {
  1: { learn: [
      ["Place value to a million", "🔢", ["Each place is 10 times the one to its right.", "In 452,318 the 5 means 50,000.", "Commas group digits in threes."], "Pip read 452,318 as four hundred fifty-two thousand, three hundred eighteen."],
      ["Compare and round", "🎯", ["Compare from the biggest place.", "Round 3,486 to the nearest hundred: 3,500.", "Look at the digit to the right."], "The stadium held 48,750 people. Rounded to the nearest thousand: 49,000."]
    ], q: [
      ["e", "mc", "🔢", "What is the value of the 5 in 452,318?", ["50,000", "5,000", "500,000"], "The 5 is in the ten-thousands place."],
      ["e", "mc", "🎯", "Round 3,486 to the nearest hundred.", ["3,500", "3,400", "3,000"], "The tens digit is 8, so round up."],
      ["e", "tf", "⚖️", "70,000 is greater than 69,999.", true, "70,000 is one more than 69,999."],
      ["e", "mc", "🔢", "Which number is one hundred thousand?", ["100,000", "10,000", "1,000,000"], "Six digits: 100,000."],
      ["m", "mc", "🎯", "Round 48,750 to the nearest thousand.", ["49,000", "48,000", "50,000"], "The hundreds digit is 7, so round up."],
      ["m", "mc", "⚖️", "Which is greatest?", ["305,000", "299,999", "35,000"], "305,000 has the most hundred-thousands."],
      ["m", "match", "🔢", "Match the number to its words.", [["40,020", "Forty thousand, twenty"], ["400,200", "Four hundred thousand, two hundred"], ["4,002", "Four thousand, two"]], "Read the groups of three digits."],
      ["m", "tf", "🔢", "Each place is 100 times the place to its right.", false, "Each place is 10 times the one to its right."]
    ] },
  2: { learn: [
      ["Column addition", "➕", ["Line up the place values.", "Add right to left; carry when 10 or more."], "Ava added 4,568 + 2,795. She carried three times and got 7,363."],
      ["Column subtraction", "➖", ["Subtract right to left.", "Exchange from the next place when needed.", "Estimate first to check."], "Ben estimated 6,000 − 2,000 = 4,000, then found 6,002 − 1,875 = 4,127."]
    ], q: [
      ["e", "mc", "➕", "What is 3,200 + 1,500?", ["4,700", "4,500", "47,000"], "3,000 + 1,000 and 200 + 500."],
      ["e", "mc", "➖", "What is 5,800 − 2,300?", ["3,500", "3,300", "8,100"], "5,800 − 2,300 = 3,500."],
      ["e", "tf", "🔁", "Estimating helps check if an answer is sensible.", true, "A quick estimate catches big mistakes."],
      ["e", "mc", "➕", "What is 2,450 + 1,050?", ["3,500", "3,400", "3,050"], "2,450 + 1,050 = 3,500."],
      ["m", "mc", "➕", "What is 4,568 + 2,795?", ["7,363", "6,363", "7,263"], "Carry in the ones, tens and hundreds."],
      ["m", "mc", "➖", "What is 6,002 − 1,875?", ["4,127", "5,127", "4,137"], "Exchange across the zeros."],
      ["m", "mc", "🚗", "A car travelled 12,480 km one year and 9,730 km the next. Total?", ["22,210 km", "21,210 km", "2,750 km"], "12,480 + 9,730 = 22,210."],
      ["m", "tf", "✅", "8,000 − 3,456 = 4,544.", true, "Check: 4,544 + 3,456 = 8,000."]
    ] },
  3: { learn: [
      ["Multiply by one digit", "✖️", ["Multiply each place, then add.", "3 × 214: 3 × 200 + 3 × 10 + 3 × 4.", "= 600 + 30 + 12 = 642."], "Pip multiplied 4 × 1,203: 4,000 + 800 + 12 = 4,812."],
      ["Two-digit by two-digit", "🟦", ["Use an area model or columns.", "23 × 15 = 20 × 15 + 3 × 15.", "= 300 + 45 = 345."], "Ava drew a box: 20 × 10, 20 × 5, 3 × 10, 3 × 5. Total 345."]
    ], q: [
      ["e", "mc", "✖️", "What is 3 × 214?", ["642", "632", "217"], "600 + 30 + 12 = 642."],
      ["e", "mc", "✖️", "What is 6 × 50?", ["300", "56", "30"], "6 × 5 tens = 30 tens."],
      ["e", "tf", "🟦", "An area model splits numbers into parts.", true, "It breaks a big product into easy pieces."],
      ["e", "mc", "✖️", "What is 4 × 25?", ["100", "29", "80"], "Four quarters make 100."],
      ["m", "mc", "✖️", "What is 23 × 15?", ["345", "335", "38"], "300 + 45 = 345."],
      ["m", "mc", "✖️", "What is 4 × 1,203?", ["4,812", "4,800", "1,207"], "4,000 + 800 + 12."],
      ["m", "mc", "🍎", "A crate holds 48 apples. How many in 12 crates?", ["576", "60", "486"], "48 × 12 = 480 + 96 = 576."],
      ["m", "c2", "🟦", "Which two equal 24 × 11?", ["264", "240 + 24"], ["35", "2,411"], "24 × 11 = 240 + 24 = 264."]
    ] },
  4: { learn: [
      ["Dividing big numbers", "➗", ["Divide one place at a time.", "848 ÷ 4 = 212.", "Check with multiplication."], "Ben shared 848 stickers among 4 friends: 212 each."],
      ["Remainders", "🧩", ["Leftovers are the remainder.", "17 ÷ 5 = 3 remainder 2.", "Think about what the remainder means in the story."], "29 children, cars hold 4. 29 ÷ 4 = 7 r 1, so 8 cars are needed!"]
    ], q: [
      ["e", "mc", "➗", "What is 848 ÷ 4?", ["212", "202", "844"], "Each place divides by 4."],
      ["e", "mc", "🧩", "17 ÷ 5 = 3 remainder…", ["2", "3", "5"], "5 × 3 = 15, 17 − 15 = 2.", "17 divided by 5 is 3, remainder what?"],
      ["e", "tf", "➗", "You can check division with multiplication.", true, "212 × 4 = 848."],
      ["e", "mc", "➗", "What is 90 ÷ 3?", ["30", "27", "93"], "9 tens ÷ 3 = 3 tens."],
      ["m", "mc", "🚗", "29 children, 4 per car. How many cars are needed?", ["8", "7", "7 r 1"], "7 cars leave 1 child, so 8 cars."],
      ["m", "mc", "➗", "What is 1,236 ÷ 6?", ["206", "216", "26"], "12 ÷ 6 = 2, 3 ÷ 6 = 0 r 3, 36 ÷ 6 = 6."],
      ["m", "mc", "🍪", "50 cookies into bags of 8. How many full bags?", ["6", "7", "42"], "8 × 6 = 48, 2 left over."],
      ["m", "tf", "🧩", "A remainder can be bigger than the number you divide by.", false, "If it were, you could divide again."]
    ] },
  5: { learn: [
      ["Factors", "🔍", ["Factors multiply to make a number.", "Factors of 12: 1, 2, 3, 4, 6, 12.", "Find them in pairs."], "Ava arranged 12 tiles as 1 × 12, 2 × 6 and 3 × 4."],
      ["Multiples and primes", "🔢", ["Multiples of 4: 4, 8, 12, 16…", "A prime has exactly two factors: 1 and itself.", "2, 3, 5, 7, 11 are prime."], "Ben tried to arrange 7 tiles in rows. Only 1 × 7 worked. 7 is prime!"]
    ], q: [
      ["e", "mc", "🔍", "Which is a factor of 12?", ["4", "5", "24"], "4 × 3 = 12."],
      ["e", "mc", "🔢", "Which is a multiple of 5?", ["35", "32", "51"], "35 = 5 × 7."],
      ["e", "tf", "🔢", "7 is a prime number.", true, "Its only factors are 1 and 7."],
      ["e", "mc", "🔢", "Which number is prime?", ["11", "9", "15"], "11 has only two factors."],
      ["m", "c2", "🔍", "Which two are factors of 18?", ["3", "6"], ["4", "8"], "3 × 6 = 18."],
      ["m", "mc", "🔢", "Which is not prime?", ["21", "13", "17"], "21 = 3 × 7."],
      ["m", "mc", "🔍", "How many factors does 16 have?", ["5", "4", "8"], "1, 2, 4, 8, 16."],
      ["m", "tf", "🔢", "1 is a prime number.", false, "1 has only one factor, so it is not prime."]
    ] },
  6: { learn: [
      ["Equivalent fractions", "🍕", ["Multiply top and bottom by the same number.", "1/2 = 2/4 = 4/8.", "Compare with a common denominator."], "Pip cut his pizza into 8: 4/8 was exactly the same as 1/2."],
      ["Adding fractions", "➕", ["Same denominators: add the tops.", "2/7 + 3/7 = 5/7.", "Multiply a fraction by a whole: 3 × 1/4 = 3/4."], "Ava ate 2/8 of a cake and Ben ate 3/8. Together 5/8."]
    ], q: [
      ["e", "mc", "🍕", "Which equals 1/2?", ["4/8", "1/4", "3/4"], "4/8 simplifies to 1/2."],
      ["e", "mc", "➕", "2/7 + 3/7 = ?", ["5/7", "5/14", "6/7"], "Add the tops; keep sevenths."],
      ["e", "tf", "🍕", "3/6 is equivalent to 1/2.", true, "3 is half of 6."],
      ["e", "mc", "⚖️", "Which is bigger: 3/4 or 1/4?", ["3/4", "1/4", "Equal"], "Same denominator: compare tops."],
      ["m", "mc", "⚖️", "Which is bigger: 2/3 or 3/5?", ["2/3", "3/5", "Equal"], "10/15 is more than 9/15."],
      ["m", "mc", "✖️", "3 × 2/5 = ?", ["6/5", "6/15", "5/6"], "3 groups of 2/5 is 6/5."],
      ["m", "match", "🍕", "Match equivalent fractions.", [["2/3", "6/9"], ["3/4", "9/12"], ["1/5", "2/10"]], "Multiply top and bottom by the same number."],
      ["m", "tf", "➕", "1/3 + 1/3 = 2/6.", false, "1/3 + 1/3 = 2/3. Keep the denominator."]
    ] },
  7: { learn: [
      ["Decimals", "🔟", ["Tenths: 0.1 = 1/10.", "Hundredths: 0.01 = 1/100.", "0.75 = 75/100 = 3/4."], "A dollar has 100 cents. 0.25 dollars is 25 cents."],
      ["Negative numbers", "🌡️", ["Numbers below zero are negative.", "−5 °C is colder than 2 °C.", "On a number line, left is smaller."], "In Stockholm it was −8 °C. In Chennai it was 32 °C!"]
    ], q: [
      ["e", "mc", "🔟", "What is 3/10 as a decimal?", ["0.3", "3.10", "0.03"], "Three tenths is 0.3."],
      ["e", "mc", "💲", "0.25 of a dollar is how many cents?", ["25", "2.5", "250"], "0.25 = 25 hundredths."],
      ["e", "tf", "🌡️", "−5 is less than 2.", true, "Negative numbers are below zero."],
      ["e", "mc", "🔟", "What is 47/100 as a decimal?", ["0.47", "4.7", "47.0"], "47 hundredths = 0.47."],
      ["m", "mc", "⚖️", "Which is greatest?", ["0.6", "0.59", "0.09"], "6 tenths beats 5 tenths."],
      ["m", "mc", "🌡️", "It is −3 °C and warms by 5 degrees. New temperature?", ["2 °C", "−8 °C", "8 °C"], "Count up from −3 by 5: 2."],
      ["m", "c2", "🔟", "Which two equal 1/2?", ["0.5", "0.50"], ["0.2", "0.05"], "0.5 and 0.50 are the same."],
      ["m", "tf", "🌡️", "−10 °C is warmer than −2 °C.", false, "−10 is further below zero, so colder."]
    ] },
  8: { learn: [
      ["Angles", "📐", ["Angles are measured in degrees.", "Right angle: 90°. Acute: less than 90°.", "Obtuse: between 90° and 180°."], "The corner of Ava's book was a perfect right angle: 90°."],
      ["Lines and symmetry", "🦋", ["Parallel lines never meet.", "Perpendicular lines meet at a right angle.", "A line of symmetry folds a shape into matching halves."], "A butterfly has one line of symmetry down its middle."]
    ], q: [
      ["e", "mc", "📐", "A right angle measures…", ["90°", "45°", "180°"], "Right angles are 90 degrees.", "How many degrees is a right angle?"],
      ["e", "mc", "📐", "An angle smaller than 90° is…", ["Acute", "Obtuse", "Straight"], "Acute angles are less than 90°.", "What is an angle smaller than 90 degrees called?"],
      ["e", "tf", "🛤️", "Parallel lines never meet.", true, "Like train tracks."],
      ["e", "mc", "🦋", "How many lines of symmetry does a butterfly shape have?", ["1", "2", "0"], "One line down the middle."],
      ["m", "mc", "📐", "An angle of 120° is…", ["Obtuse", "Acute", "Right"], "Between 90° and 180° is obtuse.", "Is an angle of 120 degrees acute, right or obtuse?"],
      ["m", "mc", "⬛", "How many lines of symmetry does a square have?", ["4", "2", "1"], "2 diagonals plus 2 middle lines."],
      ["m", "tf", "➕", "Perpendicular lines meet at a right angle.", true, "Like the corner of a page."],
      ["m", "mc", "🕒", "At 3 o'clock, the clock hands make what angle?", ["90°", "180°", "45°"], "A quarter turn is 90°.", "At 3 o'clock, what angle do the clock hands make?"]
    ] }
});
