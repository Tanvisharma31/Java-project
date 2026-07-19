import pandas as pd
file_path = r'e:\original_1784116123_8_Electicity_Bill_Management\8_Electicity Bill Management\4_PBL_Programming.xlsx'
df = pd.read_excel(file_path, sheet_name=None)
with open('excel_dump.md', 'w') as f:
    for k, v in df.items():
        f.write(f'# {k}\n\n')
        f.write(v.to_markdown() + '\n\n')
