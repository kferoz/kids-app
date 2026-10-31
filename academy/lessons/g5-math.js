/* Academy lessons: Grade 5 Math (js/syllabus.js g5.math). Format: academy/js/lessons.js. */
AcademyLessons.add("g5-math", {
  1: { learn: [
      ["Powers of ten", "🔟", ["× 10 moves digits one place left.", "÷ 100 moves digits two places right.", "4.7 × 100 = 470."], "Pip multiplied 0.35 by 1,000: the digits jumped three places. 350!"],
      ["Thousandths", "🔬", ["0.001 is one thousandth.", "Compare decimals place by place.", "0.405 < 0.45."], "The race times were 9.581 s and 9.58 s. The second was faster by a thousandth!"]
    ], q: [
      ["e", "mc", "🔟", "What is 4.7 × 100?", ["470", "47", "4,700"], "Digits move two places left."],
      ["e", "mc", "🔟", "What is 3,600 ÷ 100?", ["36", "360", "3.6"], "Digits move two places right."],
      ["e", "tf", "🔬", "0.001 is one thousandth.", true, "1 ÷ 1,000 = 0.001."],
      ["e", "mc", "⚖️", "Which is greater: 0.45 or 0.405?", ["0.45", "0.405", "Equal"], "0.450 > 0.405."],
      ["m", "mc", "🔟", "What is 0.35 × 1,000?", ["350", "35", "3,500"], "Three places left."],
      ["m", "mc", "🔢", "What is 2.5 ÷ 10?", ["0.25", "25", "0.025"], "One place right."],
      ["m", "c2", "⚖️", "Which two are equal to 0.6?", ["0.60", "0.600"], ["0.06", "6.0"], "Trailing zeros do not change value."],
      ["m", "tf", "🏃", "9.581 seconds is faster than 9.58 seconds.", false, "9.581 is a little longer, so slower."]
    ] },
  2: { learn: [
      ["Long multiplication", "✖️", ["Multiply by the ones, then the tens.", "Add the partial products.", "234 × 26 = 1,404 + 4,680 = 6,084."], "Ava multiplied 234 × 26 in two rows and added them."],
      ["Long division", "➗", ["Divide, multiply, subtract, bring down.", "Estimate with multiples of the divisor.", "864 ÷ 24 = 36."], "Ben asked: how many 24s in 86? Three. 72. Remainder 14, bring down 4: 144 ÷ 24 = 6."]
    ], q: [
      ["e", "mc", "✖️", "What is 30 × 40?", ["1,200", "120", "70"], "3 × 4 = 12, then two zeros."],
      ["e", "mc", "➗", "What is 480 ÷ 12?", ["40", "4", "400"], "12 × 4 = 48, so 480 ÷ 12 = 40."],
      ["e", "tf", "➗", "Long division steps: divide, multiply, subtract, bring down.", true, "Repeat until done."],
      ["e", "mc", "✖️", "What is 25 × 12?", ["300", "250", "37"], "25 × 12 = 300."],
      ["m", "mc", "✖️", "What is 234 × 26?", ["6,084", "5,084", "6,184"], "1,404 + 4,680 = 6,084."],
      ["m", "mc", "➗", "What is 864 ÷ 24?", ["36", "34", "46"], "24 × 36 = 864."],
      ["m", "mc", "🚌", "A school needs to carry 342 children in buses of 45. How many buses?", ["8", "7", "7 r 27"], "7 buses carry 315; 27 still need a bus."],
      ["m", "tf", "✅", "To check 1,008 ÷ 14 = 72, multiply 72 × 14.", true, "72 × 14 = 1,008."]
    ] },
  3: { learn: [
      ["Add and subtract decimals", "💲", ["Line up the decimal points.", "3.45 + 2.7 = 6.15."], "Ava's snacks cost 3.45 and 2.70. Total 6.15."],
      ["Multiply and divide decimals", "🧮", ["Multiply as whole numbers, then place the point.", "0.4 × 0.3 = 0.12.", "6.3 ÷ 3 = 2.1."], "Ben bought 3 pens at 1.25 each: 3.75."]
    ], q: [
      ["e", "mc", "💲", "What is 3.45 + 2.7?", ["6.15", "5.15", "3.72"], "Line up the points: 3.45 + 2.70."],
      ["e", "mc", "💲", "What is 10 − 4.25?", ["5.75", "6.25", "5.25"], "10.00 − 4.25 = 5.75."],
      ["e", "tf", "🧮", "To add decimals, line up the decimal points.", true, "Place values must match."],
      ["e", "mc", "✏️", "3 pens cost 1.25 each. Total?", ["3.75", "3.25", "4.25"], "1.25 × 3 = 3.75."],
      ["m", "mc", "🧮", "What is 0.4 × 0.3?", ["0.12", "1.2", "0.012"], "4 × 3 = 12, two decimal places."],
      ["m", "mc", "➗", "What is 6.3 ÷ 3?", ["2.1", "21", "0.21"], "63 ÷ 3 = 21, so 2.1."],
      ["m", "mc", "🛒", "You pay 20 for items costing 7.85 and 6.40. Change?", ["5.75", "14.25", "6.75"], "7.85 + 6.40 = 14.25; 20 − 14.25 = 5.75."],
      ["m", "tf", "🧮", "0.5 × 0.5 = 2.5.", false, "0.5 × 0.5 = 0.25."]
    ] },
  4: { learn: [
      ["Unlike denominators", "🍰", ["Find a common denominator.", "1/2 + 1/3 = 3/6 + 2/6 = 5/6."], "Pip ate 1/2 of one pizza and 1/3 of another. Together 5/6 of a pizza."],
      ["Mixed numbers", "🥧", ["2 1/4 means 2 wholes and a quarter.", "Add wholes, then fractions.", "Regroup if the fraction is more than 1."], "Ava used 1 3/4 cups of flour and 1/2 cup more: 2 1/4 cups."]
    ], q: [
      ["e", "mc", "🍰", "1/2 + 1/4 = ?", ["3/4", "2/6", "1/6"], "1/2 = 2/4, so 2/4 + 1/4 = 3/4."],
      ["e", "mc", "🍰", "3/4 − 1/4 = ?", ["1/2", "2/0", "1/4"], "2/4 = 1/2."],
      ["e", "tf", "🍰", "To add 1/2 and 1/3, first find a common denominator.", true, "Sixths work for both."],
      ["e", "mc", "🥧", "2 1/4 means…", ["2 wholes and 1 quarter", "2 quarters", "21 quarters"], "Mixed numbers combine wholes and parts.", "What does 2 and one quarter mean?"],
      ["m", "mc", "🍰", "1/2 + 1/3 = ?", ["5/6", "2/5", "1/6"], "3/6 + 2/6 = 5/6."],
      ["m", "mc", "🍰", "2/3 − 1/6 = ?", ["1/2", "1/3", "1/6"], "4/6 − 1/6 = 3/6 = 1/2."],
      ["m", "mc", "🥣", "1 3/4 cups + 1/2 cup = ?", ["2 1/4 cups", "1 4/6 cups", "2 cups"], "3/4 + 2/4 = 5/4 = 1 1/4; plus 1 whole."],
      ["m", "tf", "🍰", "1/3 + 1/4 = 2/7.", false, "4/12 + 3/12 = 7/12."]
    ] },
  5: { learn: [
      ["Fraction × fraction", "✂️", ["Multiply tops, multiply bottoms.", "1/2 × 3/4 = 3/8.", "Of means multiply: 1/2 of 3/4."], "Half of three quarters of a cake is three eighths."],
      ["Dividing fractions", "➗", ["How many halves in 3? 3 ÷ 1/2 = 6.", "1/3 ÷ 2 = 1/6."], "Ben cut 3 sandwiches into halves: 6 pieces."]
    ], q: [
      ["e", "mc", "✂️", "1/2 × 1/2 = ?", ["1/4", "1", "2/4 + 1"], "1 × 1 over 2 × 2."],
      ["e", "mc", "✂️", "1/2 of 10 = ?", ["5", "20", "2"], "Half of 10 is 5."],
      ["e", "tf", "✂️", "To multiply fractions, multiply the tops and the bottoms.", true, "Numerator × numerator, denominator × denominator."],
      ["e", "mc", "➗", "How many halves are in 3?", ["6", "1.5", "3"], "Each whole has 2 halves."],
      ["m", "mc", "✂️", "1/2 × 3/4 = ?", ["3/8", "4/6", "3/6"], "1 × 3 over 2 × 4."],
      ["m", "mc", "➗", "1/3 ÷ 2 = ?", ["1/6", "2/3", "3/2"], "Splitting a third into 2 parts gives sixths."],
      ["m", "mc", "🎂", "2/3 of 12 cupcakes are chocolate. How many?", ["8", "4", "6"], "12 ÷ 3 × 2 = 8."],
      ["m", "tf", "✂️", "Multiplying by a fraction less than 1 makes a number bigger.", false, "It makes it smaller."]
    ] },
  6: { learn: [
      ["Percent", "💯", ["Percent means out of 100.", "50% = 1/2 = 0.5.", "25% = 1/4 = 0.25."], "The shop had 25% off. A 40 kronor book cost 30 kronor."],
      ["Ratio", "⚖️", ["A ratio compares amounts: 2 to 3.", "For every 2 red there are 3 blue."], "Ava mixed 1 cup of juice to 3 cups of water."]
    ], q: [
      ["e", "mc", "💯", "50% is the same as…", ["1/2", "1/5", "5"], "Fifty out of a hundred is a half."],
      ["e", "mc", "💯", "25% as a decimal is…", ["0.25", "2.5", "25.0"], "25 hundredths."],
      ["e", "tf", "💯", "Percent means out of 100.", true, "Per cent = per hundred."],
      ["e", "mc", "⚖️", "2 red for every 3 blue is a ratio of…", ["2 : 3", "3 : 2", "5 : 1"], "Red to blue, 2 to 3.", "2 red for every 3 blue. What is the ratio of red to blue?"],
      ["m", "mc", "🏷️", "A 40 kr book is 25% off. New price?", ["30 kr", "35 kr", "10 kr"], "25% of 40 is 10; 40 − 10 = 30."],
      ["m", "mc", "💯", "What is 10% of 250?", ["25", "2.5", "10"], "250 ÷ 10 = 25."],
      ["m", "mc", "🧃", "Juice to water is 1 : 3. How much water for 2 cups of juice?", ["6 cups", "3 cups", "4 cups"], "Double both: 2 : 6."],
      ["m", "match", "💯", "Match equal values.", [["75%", "3/4"], ["20%", "1/5"], ["10%", "0.1"]], "Fractions, decimals and percents are linked."]
    ] },
  7: { learn: [
      ["Volume", "🧊", ["Volume is space inside a 3D shape.", "Box volume = length × width × height.", "Measured in cubic units."], "Ben's box was 4 × 3 × 2 cm: 24 cubic centimetres."],
      ["Order of operations", "🧮", ["Brackets first.", "Then × and ÷, left to right.", "Then + and −, left to right."], "Ava solved 2 + 3 × 4 = 14, not 20: multiply first!"]
    ], q: [
      ["e", "mc", "🧊", "A box is 4 cm by 3 cm by 2 cm. Volume?", ["24 cm³", "9 cm³", "14 cm³"], "4 × 3 × 2 = 24.", "A box is 4 by 3 by 2 centimetres. What is its volume?"],
      ["e", "tf", "🧮", "In 2 + 3 × 4, you multiply first.", true, "× comes before +."],
      ["e", "mc", "🧮", "What is (2 + 3) × 4?", ["20", "14", "24"], "Brackets first: 5 × 4."],
      ["e", "mc", "📦", "Volume is measured in…", ["Cubic units", "Square units", "Degrees"], "3D space uses cubes.", "What is volume measured in?"],
      ["m", "mc", "🧮", "What is 2 + 3 × 4?", ["14", "20", "24"], "3 × 4 = 12, plus 2."],
      ["m", "mc", "🧮", "What is 18 − 6 ÷ 3?", ["16", "4", "12"], "6 ÷ 3 = 2, 18 − 2 = 16."],
      ["m", "mc", "🐠", "A fish tank is 50 cm × 20 cm × 30 cm. Volume?", ["30,000 cm³", "100 cm³", "3,000 cm³"], "50 × 20 × 30 = 30,000.", "A fish tank is 50 by 20 by 30 centimetres. What is its volume?"],
      ["m", "tf", "🧮", "10 − 2 × 3 = 24.", false, "2 × 3 = 6, 10 − 6 = 4."]
    ] },
  8: { learn: [
      ["Coordinates", "📍", ["(x, y): across first, then up.", "(3, 5) is 3 right and 5 up.", "The origin is (0, 0)."], "The treasure was at (4, 2). Pip walked 4 across and 2 up!"],
      ["Mean and probability", "🎲", ["Mean: add all, divide by how many.", "Probability: how likely, from impossible to certain.", "A fair coin: 1 in 2 chance of heads."], "Ava scored 6, 8 and 10. Mean = 24 ÷ 3 = 8."]
    ], q: [
      ["e", "mc", "📍", "In (3, 5), how far across do you go?", ["3", "5", "8"], "The first number is across."],
      ["e", "mc", "🎲", "The chance of heads on a fair coin is…", ["1 in 2", "1 in 6", "Certain"], "Two equal outcomes.", "What is the chance of heads on a fair coin?"],
      ["e", "tf", "📍", "The origin is at (0, 0).", true, "Where the axes meet."],
      ["e", "mc", "🎲", "Rolling a 7 on a normal 1–6 dice is…", ["Impossible", "Certain", "Likely"], "There is no 7."],
      ["m", "mc", "📊", "What is the mean of 6, 8 and 10?", ["8", "24", "10"], "24 ÷ 3 = 8."],
      ["m", "mc", "🎲", "A bag has 3 red and 1 blue ball. Which is more likely?", ["Red", "Blue", "Equal"], "3 red out of 4."],
      ["m", "mc", "📊", "Mean of 2, 4, 4 and 10?", ["5", "4", "20"], "20 ÷ 4 = 5."],
      ["m", "tf", "📍", "(2, 5) and (5, 2) are the same point.", false, "Across comes first, so they differ."]
    ] }
});
