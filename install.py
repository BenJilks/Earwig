from shutil import copytree, rmtree
import os
import stat

rmtree('/usr/share/earwig')
copytree('./', '/usr/share/earwig')

launcher = open('/usr/bin/earwig', 'w')
launcher.write("""
#!/bin/bash
cd /usr/share/earwig
electron ./
""")
launcher.close()

app = open('/usr/share/applications/earwig.desktop', 'w')
app.write("""
[Desktop Entry]
Name=Earwig
GenericName=Music Player
Exec=earwig
Terminal=false
Type=Application
Keywords=Music;Audio;Player;Media
Categories=Utility;
""")
app.close()

st = os.stat('/usr/bin/earwig')
os.chmod('/usr/bin/earwig', st.st_mode | stat.S_IXOTH)
