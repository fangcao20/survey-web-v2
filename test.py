import pandas as pd
import mysql.connector as connector
import random

mydb = connector.connect(user='root', password='Phiphi05',
                         host='localhost',
                         database='survey-web')
mycursor = mydb.cursor()

df = pd.read_excel('databv.xlsx')
values = df.values.tolist()

detai_id = 33
nguoi_khao_sat = 'Test'
ngay_khao_sat = '2023-06-30'
cauhoi_id2 = [x for x in range(409, 448)]
for i in range(180):
    mycursor.execute("INSERT INTO phieukhaosat(detai_id, nguoi_khao_sat, ngay_khao_sat) VALUES (%s, %s, %s)",
                     (detai_id, nguoi_khao_sat, ngay_khao_sat))
    phieukhaosat_id = mycursor.lastrowid
    c403 = random.randint(0, 3)
    c404 = random.randint(0, 1)
    c405 = random.randint(0, 1)
    c406 = random.randint(0, 4)
    c407 = random.randint(0, 3)
    c408 = random.randint(0, 1)
    mycursor.execute("INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES (%s, %s, %s)",
                     (phieukhaosat_id, 403, c403))
    mycursor.execute("INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES (%s, %s, %s)",
                     (phieukhaosat_id, 404, c404))
    mycursor.execute("INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES (%s, %s, %s)",
                     (phieukhaosat_id, 405, c405))
    mycursor.execute("INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES (%s, %s, %s)",
                     (phieukhaosat_id, 406, c406))
    mycursor.execute("INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES (%s, %s, %s)",
                     (phieukhaosat_id, 407, c407))
    mycursor.execute("INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES (%s, %s, %s)",
                     (phieukhaosat_id, 408, c408))
    results = values[i]
    for k in range(len(cauhoi_id2)):
        mycursor.execute("INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES (%s, %s, %s)",
                         (phieukhaosat_id, cauhoi_id2[k], int(results[k])-1))
mydb.commit()
