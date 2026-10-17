#!/usr/bin/env python3
"""Generate the Subtraction Notebook Quest practice worksheet + answer key PDF."""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                 PageBreak, KeepTogether, HRFlowable)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleBig', fontName='Helvetica-Bold', fontSize=24,
                           alignment=TA_CENTER, textColor=colors.HexColor('#2b2a4a'), spaceAfter=6))
styles.add(ParagraphStyle(name='Subtitle', fontName='Helvetica', fontSize=12,
                           alignment=TA_CENTER, textColor=colors.HexColor('#555555'), spaceAfter=14))
styles.add(ParagraphStyle(name='SectionHead', fontName='Helvetica-Bold', fontSize=13.5,
                           leading=17, textColor=colors.white, spaceAfter=0, spaceBefore=0))
styles.add(ParagraphStyle(name='QNum', fontName='Helvetica-Bold', fontSize=11,
                           textColor=colors.HexColor('#4f8cff')))
styles.add(ParagraphStyle(name='QText', fontName='Helvetica', fontSize=11.3,
                           leading=15, textColor=colors.HexColor('#222222')))
styles.add(ParagraphStyle(name='PartLabel', fontName='Helvetica-Bold', fontSize=10.3,
                           textColor=colors.HexColor('#ff9f43')))
styles.add(ParagraphStyle(name='Instr', fontName='Helvetica-Oblique', fontSize=10.5,
                           textColor=colors.HexColor('#555555'), spaceAfter=10))
styles.add(ParagraphStyle(name='AnsKey', fontName='Helvetica', fontSize=10,
                           leading=14))
styles.add(ParagraphStyle(name='AnsKeyHead', fontName='Helvetica-Bold', fontSize=12.5,
                           textColor=colors.HexColor('#4f8cff'), spaceBefore=10, spaceAfter=4))

SECTION_COLORS = {
    'mental':'#4f8cff', 'three':'#8a6bff', 'four':'#ff6b9d',
    'subfrom':'#2ecc71', 'diff':'#ff9f43', 'word':'#e67e22', 'multi':'#9b59b6'
}
SECTION_NAMES = {
    'mental':'Mental Math Warm-Up — subtract each pair of numbers. Use number bonds to help you.',
    'three':'3-Digit Subtraction — subtract. Show your work.',
    'four':'4-Digit Subtraction — subtract. Show your work.',
    'subfrom':'"Subtract From" Phrasing — read carefully, then subtract.',
    'diff':'"Difference Between" Phrasing — find the difference.',
    'word':'Word Problem Adventures — solve. Draw a bar model to help you.',
    'multi':'Multi-Part Challenges — answer every part.',
}

# ---- Question bank (mirrors the app; same numbers, renamed characters, 21 new problems) ----
# each item: section, prompt (string, may include \n for multi-part via 'parts': [(label,text,ans,work_h)]),
# answer (string) for single-part, work_h = height in points of the work box
Q = []
def add(section, prompt, answer, work_h=46, parts=None):
    Q.append(dict(section=section, prompt=prompt, answer=answer, work_h=work_h, parts=parts))

# MENTAL MATH (9)
add('mental', 'Buddy the Explorer says: 87 − 62 = ____', '25', 40)
add('mental', 'Buddy the Explorer says: 53 − 11 = ____', '42', 40)
add('mental', 'Buddy the Explorer says: 65 − 27 = ____', '38', 40)
add('mental', 'Buddy the Explorer says: 92 − 44 = ____', '48', 40)
add('mental', 'Buddy the Explorer says: 76 − 54 = ____', '22', 40)
add('mental', 'Buddy the Explorer says: 91 − 38 = ____', '53', 40)
add('mental', 'Buddy the Explorer says: 68 − 19 = ____', '49', 40)
add('mental', 'Buddy the Explorer says: 84 − 56 = ____', '28', 40)
add('mental', 'Buddy the Explorer says: 95 − 47 = ____', '48', 40)

# 3-DIGIT (4)
add('three', '457 − 233 = ____', '224', 60)
add('three', '896 − 297 = ____', '599', 60)
add('three', '523 − 186 = ____', '337', 60)
add('three', '741 − 368 = ____', '373', 60)

# 4-DIGIT (4)
add('four', '4,368 − 546 = ____', '3,822', 60)
add('four', '7,134 − 2,857 = ____', '4,277', 60)
add('four', '5,236 − 748 = ____', '4,488', 60)
add('four', '8,403 − 2,967 = ____', '5,436', 60)

# SUBTRACT FROM (4)
add('subfrom', 'Subtract 427 from 821.', '394', 50)
add('subfrom', 'Subtract 695 from 6,304.', '5,609', 50)
add('subfrom', 'Subtract 356 from 702.', '346', 50)
add('subfrom', 'Subtract 1,284 from 5,000.', '3,716', 50)

# DIFFERENCE BETWEEN (4)
add('diff', 'The difference between 1,981 and 5,000 is ____.', '3,019', 50)
add('diff', 'The difference between 7,200 and 2,305 is ____.', '4,895', 50)
add('diff', 'The difference between 2,345 and 6,000 is ____.', '3,655', 50)
add('diff', 'The difference between 8,100 and 3,452 is ____.', '4,648', 50)

# WORD PROBLEMS (11)
add('word', 'A piano costs $4,770. An organ costs $3,250 less than the piano. Find the total cost of the piano and the organ.', '$6,290', 70)
add('word', 'A school prepared 9,000 red and green goody bags in all. There were 3,845 red goody bags. How many more green goody bags than red goody bags were there?', '1,310', 70)
add('word', 'Luna and Milo saved the same amount of money. Milo bought a bag for $9.14 and had $16.25 left. Luna bought a book and had $19.51 left. How much did the book cost?', '$5.88', 70)
add('word', 'Mr. Diaz bought some nuts and raisins. He bought 1,425 grams of nuts and 1,098 grams of raisins. How much greater is the mass of the nuts than the mass of the raisins?', '327 grams', 60)
add('word', 'There were 2,800 fruit bars on a shelf at a store. 1,855 of the fruit bars were sold. The store then put up another 738 fruit bars on the shelf. How many fruit bars were on the shelf in the end?', '1,683', 70)
add('word', 'A telescope costs $3,680. A microscope costs $1,450 less than the telescope. Find the total cost of the telescope and the microscope.', '$5,910', 70)
add('word', 'Diego’s Bakery made 8,000 blue and yellow cupcakes in all. There were 3,415 blue cupcakes. How many more yellow cupcakes than blue cupcakes were there?', '1,170', 70)
add('word', 'Leo and Mia saved the same amount of money. Leo bought a toy for $12.45 and had $8.30 left. Mia bought a puzzle and had $11.60 left. How much did the puzzle cost?', '$9.15', 70)
add('word', 'Mr. Lee bought some flour and sugar. He bought 2,350 grams of flour and 1,675 grams of sugar. How much greater is the mass of the flour than the mass of the sugar?', '675 grams', 60)
add('word', 'The Riverbend Library had 4,500 books. 1,275 books were checked out. The library then added 920 new books. How many books were on the shelf in the end?', '4,145', 70)
add('word', 'A zoo had 3,800 visitors on Saturday. 1,462 visitors left by noon. The zoo then welcomed another 615 visitors in the afternoon. How many visitors were at the zoo by the end of the day?', '2,953', 70)

# MULTI-PART (4)
add('multi', 'A class of students raised $1,000 for charity. Max raised $28. Zoe raised $67.', None, parts=[
    ('Part A', 'How much money did the rest of the class raise for the charity?', '$905', 60),
    ('Part B', 'Theo raised $5 less than Max. How much more money did Zoe raise than Theo?', '$44', 60),
])
add('multi', 'There were 3,524 people at a football game. 1,045 people supported Team A. 894 people supported Team B. The rest were neutral.', None, parts=[
    ('Part A', 'Round each of the three numbers to the nearest hundred.', '3,500, 1,000, 900', 36),
    ('Part B', 'Use the rounded numbers to estimate the number of people who were neutral.', '1,600', 60),
])
add('multi', 'A bake sale raised $1,500 in total. Noah raised $235. Ivy raised $389.', None, parts=[
    ('Part A', 'How much money did the rest of the bake sale raise?', '$876', 60),
    ('Part B', 'Ella raised $15 less than Noah. How much more money did Ivy raise than Ella?', '$169', 60),
])
add('multi', 'There were 4,268 people at a concert. 1,356 people sat in Section A. 1,872 people sat in Section B. The rest stood.', None, parts=[
    ('Part A', 'Round each of the three numbers to the nearest hundred.', '4,300, 1,400, 1,900', 36),
    ('Part B', 'Use the rounded numbers to estimate the number of people who stood.', '1,000', 60),
])

assert len(Q) == 40, len(Q)
ORIGINAL_COUNT = 19
NEW_COUNT = 21
print(f"Total questions: {len(Q)}")

# ---------------------------------------------------------------------------
def work_box(height):
    t = Table([['']], colWidths=[6.3*inch], rowHeights=[height])
    t.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#c9c9e0')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fbfbff')),
    ]))
    return t

def section_banner(key):
    color = colors.HexColor(SECTION_COLORS[key])
    t = Table([[Paragraph(SECTION_NAMES[key], styles['SectionHead'])]], colWidths=[6.3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
    ]))
    return t

def build():
    doc = SimpleDocTemplate("/tmp/build/subtraction-notebook-quest-worksheets.pdf", pagesize=letter,
                             topMargin=0.55*inch, bottomMargin=0.55*inch,
                             leftMargin=0.6*inch, rightMargin=0.6*inch)
    story = []

    # ---- Title page ----
    story.append(Spacer(1, 40))
    story.append(Paragraph("Number Explorers", styles['TitleBig']))
    story.append(Paragraph("Subtraction Notebook Quest — Practice Worksheets", ParagraphStyle(
        name='T2', fontName='Helvetica-Bold', fontSize=15, alignment=TA_CENTER,
        textColor=colors.HexColor('#4f8cff'), spaceAfter=16)))
    story.append(Spacer(1, 8))
    nt = Table([[Paragraph('Name: _____________________________', styles['QText']),
                 Paragraph('Date: ______________', styles['QText'])]],
               colWidths=[4.3*inch, 2*inch])
    nt.setStyle(TableStyle([('TOPPADDING',(0,0),(-1,-1),4)]))
    story.append(nt)
    story.append(Spacer(1, 18))
    story.append(Paragraph(
        f"This workbook has <b>{len(Q)} subtraction problems</b> ({ORIGINAL_COUNT} chapter-review questions plus "
        f"{NEW_COUNT} brand-new bonus problems!) across 7 notebook sections: Mental Math, 3-Digit Subtraction, "
        f"4-Digit Subtraction, &ldquo;Subtract From&rdquo; Phrasing, &ldquo;Difference Between&rdquo; Phrasing, "
        f"Word Problem Adventures, and Multi-Part Challenges.", styles['Instr']))
    story.append(Paragraph(
        "Show your work in each box. Use number bonds, regrouping, or bar models to help you. "
        "An answer key is at the very end of this workbook.", styles['Instr']))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width='100%', color=colors.HexColor('#dddddd')))
    story.append(PageBreak())

    qnum = 0
    current_section = None
    for item in Q:
        if item['section'] != current_section:
            current_section = item['section']
            story.append(section_banner(current_section))
            story.append(Spacer(1, 10))
        qnum += 1
        block = []
        if item['parts'] is None:
            head = Table([[Paragraph(f"{qnum}.", styles['QNum']),
                            Paragraph(item['prompt'], styles['QText'])]],
                          colWidths=[0.42*inch, 5.88*inch])
            head.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'), ('TOPPADDING',(0,0),(-1,-1),2)]))
            block.append(head)
            block.append(Spacer(1, 4))
            block.append(work_box(item['work_h']))
        else:
            head = Table([[Paragraph(f"{qnum}.", styles['QNum']),
                            Paragraph(item['prompt'], styles['QText'])]],
                          colWidths=[0.42*inch, 5.88*inch])
            head.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'), ('TOPPADDING',(0,0),(-1,-1),2)]))
            block.append(head)
            block.append(Spacer(1, 4))
            for label, ptext, ans, h in item['parts']:
                block.append(Paragraph(label, styles['PartLabel']))
                block.append(Paragraph(ptext, styles['QText']))
                block.append(Spacer(1, 3))
                block.append(work_box(h))
                block.append(Spacer(1, 6))
        block.append(Spacer(1, 14))
        story.append(KeepTogether(block))

    # ---- Answer key ----
    story.append(PageBreak())
    story.append(Paragraph("Answer Key", styles['TitleBig']))
    story.append(Spacer(1, 6))
    qnum = 0
    rows = [['#', 'Answer', '#', 'Answer']]
    flat = []
    for item in Q:
        qnum += 1
        if item['parts'] is None:
            flat.append((str(qnum), item['answer']))
        else:
            for label, ptext, ans, h in item['parts']:
                flat.append((f"{qnum} ({label.split()[1]})", ans))
    # pair up into 2 columns
    half = (len(flat)+1)//2
    left = flat[:half]
    right = flat[half:]
    for i in range(half):
        l = left[i]
        r = right[i] if i < len(right) else ('', '')
        rows.append([l[0], l[1], r[0], r[1]])
    at = Table(rows, colWidths=[0.7*inch, 2.4*inch, 0.7*inch, 2.4*inch])
    at.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4f8cff')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#dddddd')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f5f7ff')]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(at)

    doc.build(story)
    print("PDF built.")

if __name__ == '__main__':
    build()
