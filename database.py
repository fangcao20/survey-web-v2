import mysql.connector as connector
import csv

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
    if 'detai_id' not in detai:
        values = (detai['user_id'], detai['ma_de_tai'], detai['ten_de_tai'],
                  detai['nguoi_thuc_hien'], detai['ngay_thuc_hien'], detai['mo_ta'], detai['token'])
        sql = """INSERT INTO detai(user_id, ma_de_tai, ten_de_tai, nguoi_thuc_hien, ngay_thuc_hien, mo_ta, token)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)"""
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


def lay_cau_hoi(data, trang_thai):
    nhomcauhoi_id = data['nhomcauhoi_id'].replace('"', '')
    detai_id = str(data['detai_id']).replace('"', '')
    if trang_thai != '':
        if nhomcauhoi_id == 'Chọn':
            sql = "SELECT * FROM cauhoi WHERE detai_id = %s and trang_thai = %s"
            mycursor.execute(sql, (detai_id, trang_thai))
            result = mycursor.fetchall()
        else:
            sql = "SELECT * FROM cauhoi WHERE nhomcauhoi_id = %s and trang_thai = %s"
            mycursor.execute(sql, (nhomcauhoi_id, trang_thai))
            result = mycursor.fetchall()
    else:
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
    values = (cauhoi['detai_id'].replace('"', ''), cauhoi['nhomcauhoi_id'].replace('"', ''), cauhoi['ma_cau_hoi'],
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
    mydb.commit()
    print("Delete")


def lay_de_tai_theo_token(token):
    sql = "SELECT * FROM detai WHERE token = %s"
    mycursor.execute(sql, (token,))
    result = mycursor.fetchall()
    columns = [column[0] for column in mycursor.description]
    records = []
    for row in result:
        record = {}
        for i in range(len(columns)):
            record[columns[i]] = row[i]
        records.append(record)
    return records


def luu_ket_qua(data):
    detai_id = data['detai_id']
    checkedDict = data['checkedDict']
    thongtin = data['thong_tin']

    sql = "INSERT INTO phieukhaosat(detai_id, nguoi_khao_sat, ngay_khao_sat) VALUES (%s, %s, %s)"
    values = (detai_id, thongtin['nguoi_khao_sat'], thongtin['ngay_khao_sat'])
    mycursor.execute(sql, values)
    phieukhaosat_id = mycursor.lastrowid

    for cauhoi_id, luachon in checkedDict.items():  # Giá trị này chỉ là thứ tự của lựa chọn, không phải id or điểm
        # likert huhu :((
        sql = "INSERT INTO cautraloi(phieukhaosat_id, cauhoi_id, lua_chon) VALUES (%s, %s, %s)"
        values = (phieukhaosat_id, cauhoi_id, luachon)
        mycursor.execute(sql, values)
    mydb.commit()
    print("Done")


def lay_ket_qua(detai_id):
    mycursor.execute("SELECT * FROM phieukhaosat WHERE detai_id = %s", (detai_id,))
    phieukhaosats = mycursor.fetchall()
    colPHS = [column[0] for column in mycursor.description]
    ketquas = []
    dt = []
    for phieukhaosat in phieukhaosats:
        ketqua = {}
        thongtin = {}
        for i in range(len(colPHS)):
            thongtin[colPHS[i]] = phieukhaosat[i]
        ketqua['thong_tin'] = thongtin
        phieukhaosat_id = thongtin['phieukhaosat_id']
        mycursor.execute("SELECT cauhoi_id, lua_chon FROM cautraloi WHERE phieukhaosat_id = %s", (phieukhaosat_id,))
        cautralois = mycursor.fetchall()
        traloi = {}
        data = {}
        for cautraloi in cautralois:
            cauhoi_id = cautraloi[0]
            lua_chon = cautraloi[1]
            mycursor.execute("SELECT ma_cau_hoi, loaicautraloi_id FROM cauhoi WHERE cauhoi_id = %s", (cauhoi_id,))
            cauhoi = mycursor.fetchall()
            ma_cau_hoi = cauhoi[0][0]
            loaicautraloi_id = cauhoi[0][1]
            if loaicautraloi_id == 1:
                mycursor.execute("SELECT noi_dung FROM luachon WHERE cauhoi_id = %s", (cauhoi_id,))
                tra_loi = mycursor.fetchall()[lua_chon][0]
            else:
                mycursor.execute("SELECT diem_likert FROM thangdolikert WHERE cauhoi_id = %s", (cauhoi_id,))
                result = mycursor.fetchall()[lua_chon]
                tra_loi = result[0]
                data[ma_cau_hoi] = tra_loi
            traloi[ma_cau_hoi] = tra_loi
        ketqua['tra_loi'] = traloi
        ketquas.append(ketqua)
        dt.append(traloi)
    luu_csv('data.csv', dt)
    return ketquas


def luu_csv(filename, dt):
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)

        headers = dt[0].keys()
        writer.writerow(headers)

        for row in dt:
            values = [value for key, value in row.items()]
            writer.writerow(values)
    print(f'Data saved to {filename}')

def doi_trang_thai(cauhoi_id, trang_thai):
    mycursor.execute("UPDATE cauhoi SET trang_thai = %s WHERE cauhoi_id = %s", (trang_thai, cauhoi_id))
    mydb.commit()


def sang_loc(detai_id):
    import datetime
    code = '-0098-b371'  # để đánh dấu đề tài nào là đề tài mới hihi
    mycursor.execute("SELECT * FROM detai WHERE detai_id = %s", (detai_id,))
    result = mycursor.fetchall()[0]
    user_id = result[1]
    token = result[7]
    # Kiểm tra xem có phải đề tài mới tạo không
    if token.endswith(code):
        mycursor.execute("SELECT * FROM cauhoi WHERE detai_id = %s", (detai_id,))
    else:
        new_token = token + code
        mycursor.execute("SELECT token FROM detai WHERE user_id = %s", (user_id,))
        tokens = mycursor.fetchall()
        exist = False
        for tk in tokens:
            if new_token == tk[0]:
                exist = True
        if exist:  # Đề tài mới tồn tại rồi
            mycursor.execute("SELECT * FROM detai WHERE token = %s", (new_token,))
            detai_id = mycursor.fetchall()[0][0]
            mycursor.execute("SELECT * FROM cauhoi WHERE detai_id = %s", (detai_id,))
        else: # Đề tài mới chưa tồn tại
            ten_de_tai = result[3] + ' (thí điểm)'
            mycursor.execute("UPDATE detai SET ten_de_tai = %s WHERE detai_id = %s", (ten_de_tai, detai_id))
            new_detai = [result[x] for x in range(1, len(result)-1)]
            new_detai[4] = datetime.date.today()
            new_detai[6] = new_detai[6] + code
            # Tạo đề tài mới
            sql = "INSERT INTO detai(user_id, ma_de_tai, ten_de_tai, nguoi_thuc_hien, ngay_thuc_hien, mo_ta, token) VALUES (" \
                  "%s, %s, %s, %s, %s, %s, %s) "
            mycursor.execute(sql, tuple(new_detai))
            new_detai_id = mycursor.lastrowid
            # Tạo nhóm câu hỏi cho đề tài mới
            mycursor.execute("SELECT nhomcauhoi_id, ma_nhom, ten_nhom FROM nhomcauhoi WHERE detai_id = %s", (detai_id,))
            results = mycursor.fetchall()
            for r in results:
                new_r = [new_detai_id]
                new_r.append(r[1])
                new_r.append(r[2])
                mycursor.execute("INSERT INTO nhomcauhoi(detai_id, ma_nhom, ten_nhom) VALUES (%s, %s, %s)", tuple(new_r))
                nhomcauhoi_id_chenh_lech = int(mycursor.lastrowid) - int(r[0])
            # Tạo câu hỏi cho đề tài mới
            mycursor.execute("SELECT cauhoi_id, nhomcauhoi_id, ma_cau_hoi, loaicautraloi_id, noi_dung, trang_thai FROM cauhoi WHERE "
                             "detai_id = %s", (detai_id,))
            results = mycursor.fetchall()
            for row in results:
                new_row = [new_detai_id]
                new_row.append(int(row[1])+nhomcauhoi_id_chenh_lech)
                for i in range(2, len(row)):
                    new_row.append(row[i])
                mycursor.execute("""INSERT INTO cauhoi(detai_id, nhomcauhoi_id, ma_cau_hoi, loaicautraloi_id, noi_dung, trang_thai)
                                VALUES (%s, %s, %s, %s, %s, %s)""", tuple(new_row))
                new_cauhoi_id = mycursor.lastrowid
                cauhoi_id = row[0]
                loaicautraloi_id = row[3]
                if str(loaicautraloi_id) == '1':
                    mycursor.execute("SELECT noi_dung FROM luachon WHERE cauhoi_id = %s", (cauhoi_id,))
                    luachons = mycursor.fetchall()
                    for luachon in luachons:
                        mycursor.execute("INSERT INTO luachon(cauhoi_id, noi_dung) VALUES (%s, %s)", (new_cauhoi_id, luachon[0]))
                else:
                    mycursor.execute("SELECT diem_likert, noi_dung FROM thangdolikert WHERE cauhoi_id = %s", (cauhoi_id,))
                    likerts = mycursor.fetchall()
                    for likert in likerts:
                        mycursor.execute("INSERT INTO thangdolikert(cauhoi_id, diem_likert, noi_dung) VALUES (%s, %s, %s)",
                                         (new_cauhoi_id, likert[0], likert[1]))
            mydb.commit()
            mycursor.execute("SELECT * FROM cauhoi WHERE detai_id = %s", (new_detai_id,))
            print("Donee")
    result = mycursor.fetchall()
    columns = [column[0] for column in mycursor.description]
    records = []
    for row in result:
        record = {}
        for i in range(len(columns)):
            record[columns[i]] = row[i]
        records.append(record)
    return records


def lay_cau_hoi_theo_de_tai(detai_id):
    mycursor.execute("SELECT * FROM cauhoi WHERE detai_id = %s", (detai_id,))
    result = mycursor.fetchall()
    columns = [column[0] for column in mycursor.description]
    records = []
    for row in result:
        record = {}
        for i in range(len(columns)):
            record[columns[i]] = row[i]
        records.append(record)
    return records


def luu_cau_hoi_sang_loc(data):
    cauhoi_id = data['cauhoi_id']
    noi_dung = data['noi_dung']
    values = (noi_dung, cauhoi_id)
    sql = "UPDATE cauhoi SET noi_dung = %s WHERE cauhoi_id = %s"
    mycursor.execute(sql, values)
    mydb.commit()


def lay_loai_bien(detai_id):
    mycursor.execute("SELECT * FROM cauhoi WHERE detai_id = %s", (detai_id,))
    result = mycursor.fetchall()
    bienmota = []
    biendoclap = []
    for cauhoi in result:
        ma_cau_hoi = cauhoi[3]
        loaicautraloi_id = cauhoi[4]
        if str(loaicautraloi_id) == '1':
            bienmota.append(ma_cau_hoi)
        else:
            biendoclap.append(ma_cau_hoi)
    return {'bienmota': bienmota, 'biendoclap': biendoclap}