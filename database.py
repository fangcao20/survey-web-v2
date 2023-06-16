import mysql.connector as connector

mydb = connector.connect(user='root', password='Phiphi05',
                         host='localhost',
                         database='survey-web')
mycursor = mydb.cursor()


# Thêm người dùng
def them_nguoi_dung(user):
    value = (user['name'], user['email'], user['password'], user['token'])
    sql = "INSERT INTO user(name, email, password, token) VALUES (%s, %s, %s, %s)"
    mycursor.execute(sql, value)
    print(value)
    mydb.commit()


# Kiểm tra email tồn tại
def kiem_tra_email(email):
    sql = "SELECT email FROM user"
    mycursor.execute(sql)
    result = mycursor.fetchall()
    email_list = [email[0] for email in result]
    if email in email_list:
        return True


# Check password
def kiem_tra_password(email, password):
    sql = "SELECT password FROM user WHERE email = %s"
    mycursor.execute(sql, (email,))
    result = mycursor.fetchall()
    if result[0][0] == password.decode('utf-8'):
        return True


# Lấy token để khôi phục mật khẩu
def lay_token(email):
    sql = "SELECT token FROM user WHERE email = %s"
    mycursor.execute(sql, (email,))
    result = mycursor.fetchall()
    token = result[0][0]
    return token


# Lấy tên người dùng và ID
def lay_ten_id(email):
    email = email.replace('"', "")
    sql = "SELECT user_id, name FROM user WHERE email = %s"
    mycursor.execute(sql, (email,))
    result = mycursor.fetchall()
    user = {'user_id': result[0][0], 'name': result[0][1]}
    return user


# Lấy đề tài
def lay_de_tai(user_id):
    mycursor.execute("SELECT * FROM detai WHERE user_id = %s", (user_id,))
    result = mycursor.fetchall()

    # Lấy thông tin các cột
    columns = [column[0] for column in mycursor.description]

    # Tạo danh sách các dictionary
    records = []
    for row in result:
        record = {}
        for i in range(len(columns)):
            record[columns[i]] = row[i]
        records.append(record)
    return records


def luu_de_tai(detai):
    values = (detai['user_id'], detai['ma_de_tai'], detai['ten_de_tai'],
              detai['nguoi_thuc_hien'], detai['ngay_thuc_hien'], detai['mo_ta'])
    if 'detai_id' not in detai:
        sql = """INSERT INTO detai(user_id, ma_de_tai, ten_de_tai, nguoi_thuc_hien, ngay_thuc_hien, mo_ta)
                        VALUES (%s, %s, %s, %s, %s, %s)"""
        mycursor.execute(sql, values)
        print("Insert", values)
        mydb.commit()
    else:
        sql = """UPDATE detai SET
                            user_id = %s,
                            ma_de_tai = %s,
                            ten_de_tai = %s,
                            nguoi_thuc_hien = %s,
                            ngay_thuc_hien = %s,
                            mo_ta = %s
                        WHERE detai_id = %s
                        """
        values = (detai['user_id'], detai['ma_de_tai'], detai['ten_de_tai'],
              detai['nguoi_thuc_hien'], detai['ngay_thuc_hien'], detai['mo_ta'], detai['detai_id'])
        mycursor.execute(sql, values)
        print("Update", values)
        mydb.commit()


def xoa_de_tai(detai):
    values = (detai['detai_id'],)
    sql = """
                DELETE FROM detai
                WHERE detai_id = %s;
            """
    mycursor.execute(sql, values)
    mydb.commit()
    print("Delete")



def lay_nhom_cau_hoi(detai_id):
    sql = "SELECT * FROM nhomcauhoi WHERE detai_id = %s"
    mycursor.execute(sql, (detai_id,))
    result = mycursor.fetchall()
    columns = [column[0] for column in mycursor.description]
    records = []
    for row in result:
        record = {}
        for i in range(len(columns)):
            record[columns[i]] = row[i]
        records.append(record)
    return records


def luu_nhom_cau_hoi(nhomcauhoi):
    values = (nhomcauhoi['detai_id'].replace('"', ''),
              nhomcauhoi['ma_nhom'],
              nhomcauhoi['ten_nhom'])
    if 'nhomcauhoi_id' not in nhomcauhoi:
        sql = "INSERT INTO nhomcauhoi(detai_id, ma_nhom, ten_nhom) VALUES (%s, %s, %s)"
        mycursor.execute(sql, values)
        print("Insert")
    else:
        sql = """UPDATE nhomcauhoi SET
                            ma_nhom = %s,
                            ten_nhom = %s
                        WHERE nhomcauhoi_id = %s
                        """
        values = (nhomcauhoi['ma_nhom'],
                  nhomcauhoi['ten_nhom'],
                  nhomcauhoi['nhomcauhoi_id'].replace('"', ''))
        mycursor.execute(sql, values)
        print("Update")
    mydb.commit()


def xoa_nhom_cau_hoi(nhomcauhoi):
    values = (nhomcauhoi['nhomcauhoi_id'],)
    sql = """
                DELETE FROM nhomcauhoi
                WHERE nhomcauhoi_id = %s;
            """
    mycursor.execute(sql, values)
    mydb.commit()
    print("Delete")


def lay_cau_hoi(data):
    nhomcauhoi_id = data['nhomcauhoi_id'].replace('"', '')
    detai_id = data['detai_id'].replace('"', '')
    if nhomcauhoi_id == 'Chọn':
        sql = "SELECT * FROM cauhoi WHERE detai_id = %s"
        mycursor.execute(sql, (detai_id,))
        result = mycursor.fetchall()
    else:
        sql = "SELECT * FROM cauhoi WHERE nhomcauhoi_id = %s"
        mycursor.execute(sql, (nhomcauhoi_id,))
        result = mycursor.fetchall()
    columns = [column[0] for column in mycursor.description]
    records = []
    for row in result:
        record = {}
        for i in range(len(columns)):
            record[columns[i]] = row[i]
        records.append(record)
    return records


def luu_cau_hoi(cauhoi):
    values = (cauhoi['detai_id'].replace('"',''), cauhoi['nhomcauhoi_id'].replace('"',''), cauhoi['ma_cau_hoi'],
              cauhoi['loaicautraloi_id'], cauhoi['noi_dung'], cauhoi['trang_thai'])

    if 'cauhoi_id' not in cauhoi:
        sql = """INSERT INTO cauhoi(detai_id, nhomcauhoi_id, ma_cau_hoi, loaicautraloi_id, noi_dung, trang_thai)
            VALUES (%s, %s, %s, %s, %s, %s)"""
        mycursor.execute(sql, values)
        cauhoi_id = mycursor.lastrowid
        traloiList = cauhoi['tra_loi']
        luu_cau_tra_loi(traloiList, cauhoi_id)
        mydb.commit()
        print("Insert")
    else:
        sql = """UPDATE cauhoi SET detai_id = %s, nhomcauhoi_id = %s, ma_cau_hoi = %s,
            loaicautraloi_id = %s, noi_dung = %s, trang_thai = %s
            WHERE cauhoi_id = %s"""
        values += (cauhoi['cauhoi_id'],)
        mycursor.execute(sql, values)
        cauhoi_id = cauhoi['cauhoi_id']
        traloiList = cauhoi['tra_loi']
        luu_cau_tra_loi(traloiList, cauhoi_id)
        print("Update")


def lay_cau_tra_loi(data):
    loaicautraloi_id = str(data['loaicautraloi_id'])
    cauhoi_id = data['cauhoi_id']
    if loaicautraloi_id == '1':
        mycursor.execute("SELECT * FROM luachon WHERE cauhoi_id = %s", (cauhoi_id,))
        result = mycursor.fetchall()
    elif loaicautraloi_id == '2':
        mycursor.execute("SELECT * FROM thangdolikert WHERE cauhoi_id = %s", (cauhoi_id,))
        result = mycursor.fetchall()
    columns = [column[0] for column in mycursor.description]
    records = []
    for row in result:
        record = {}
        for i in range(len(columns)):
            record[columns[i]] = row[i]
        records.append(record)
    print(record)
    return records


def luu_cau_tra_loi(traloiList, cauhoi_id):
    if 'diem_likert' in traloiList[0]:
        mycursor.execute("DELETE FROM thangdolikert WHERE cauhoi_id = %s", (cauhoi_id,))
        for traloi in traloiList:
            values = (cauhoi_id, traloi['diem_likert'], traloi['noi_dung'])
            sql = "INSERT INTO thangdolikert(cauhoi_id, diem_likert, noi_dung) VALUES (%s, %s, %s)"
            mycursor.execute(sql, values)
            mydb.commit()
    else:
        mycursor.execute("DELETE FROM luachon WHERE cauhoi_id = %s", (cauhoi_id,))
        i = 0
        for traloi in traloiList:
            values = (cauhoi_id, traloi)
            sql = "INSERT INTO luachon(cauhoi_id, noi_dung) VALUES (%s, %s)"
            mycursor.execute(sql, values)
            mydb.commit()
            i += 1



def xoa_cau_hoi(data):
    cauhoi_id = data['cauhoi_id']
    mycursor.execute("DELETE FROM cauhoi WHERE cauhoi_id = %s", (cauhoi_id,))
    if data['loaicautraloi_id'] == '1':
        mycursor.execute("DELETE FROM luachon WHERE cauhoi_id = %s", (cauhoi_id,))
    else:
        mycursor.execute("DELETE FROM thangdolikert WHERE cauhoi_id = %s", (cauhoi_id,))
    mydb.commit()
    print("Delete")
