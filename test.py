import mysql.connector as connector
import pandas as pd
import random
mydb = connector.connect(user='root', password='Phiphi05',
                         host='localhost',
                         database='survey-web')
mycursor = mydb.cursor()

cauhoi_id = [75, 76, 77, 78, 79, 80, 81, 82, 83, 84]
df = pd.read_csv('survey2.csv')
df_list = df.values.tolist()
phieukhaosat_id = 76
for row in df_list:
    for i in range(len(row)):
        sql = "INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES(%s, %s, %s)"
        values = (phieukhaosat_id, cauhoi_id[i], row[i]-1)
        mycursor.execute(sql, values)
    phieukhaosat_id += 1
mydb.commit()

