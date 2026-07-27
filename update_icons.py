import os
import shutil

src = r"C:\Users\sudha\.gemini\antigravity\brain\bb69582a-39b5-4908-8706-430375123c21\.user_uploaded\media__1785132891135.jpg"
res_dir = r"C:\final_pdd\frontend\android\app\src\main\res"

for root, dirs, files in os.walk(res_dir):
    folder_name = os.path.basename(root)
    if folder_name.startswith("mipmap-"):
        for icon_name in ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]:
            dest = os.path.join(root, icon_name)
            shutil.copy2(src, dest)
            print(f"Updated {dest}")

print("Icon update complete!")
