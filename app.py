from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from database import them_nguoi_dung, kiem_tra_email, kiem_tra_password, lay_token, lay_ten_id
from database import lay_de_tai, luu_de_tai, xoa_de_tai, lay_nhom_cau_hoi, luu_nhom_cau_hoi, xoa_nhom_cau_hoi
from database import lay_cau_hoi, luu_cau_hoi, lay_cau_tra_loi, xoa_cau_hoi, lay_de_tai_theo_token, luu_ket_qua
from database import lay_ket_qua, sang_loc, lay_cau_hoi_theo_de_tai, luu_cau_hoi_sang_loc, lay_loai_bien
from phantich import cronbach, efa, hoiquy, khacbiet, thongkemota
import bcrypt
import uuid
import csv
import pandas as pd

app = Flask(__name__)
salt = b'$2b$12$iAwtlnI9D4gr9wcI5dCn2.'
app.config['SECRET_KEY'] = salt


@app.route('/dangky', methods=['GET', 'POST'])
def dangky():
    if request.method == 'POST':
        if kiem_tra_email(request.form.get('email')):
            return jsonify({'message': 'Email đã tồn tại. Vui lòng Đăng nhập hoặc sử dụng Email khác.'})
        else:
            token = str(uuid.uuid4())
            user = {'name': request.form.get('name'), 'email': request.form.get('email'), 'token': token}
            password = request.form.get('password').encode('utf-8')
            user['password'] = bcrypt.hashpw(password, salt)
            them_nguoi_dung(user)
            return jsonify({'message': 'Đăng ký thành công'})
    return render_template('dangky.html')


@app.route('/')
@app.route('/dangnhap', methods=['GET', 'POST'])
def dangnhap():
    if request.method == 'POST':
        email = request.form.get('email')
        if kiem_tra_email(email):
            password = request.form.get('password').encode('utf-8')
            hashed_password = bcrypt.hashpw(password, salt)
            if kiem_tra_password(email, hashed_password):
                name = lay_ten_id(email)['name']
                user_id = lay_ten_id(email)['user_id']
                session['user_id'] = user_id
                return jsonify({'message': 'Đăng nhập thành công', 'email': email, 'name': name, 'user_id': user_id})
            else:
                return jsonify({'message': 'Mật khẩu hoặc email không chính xác'})
        else:
            return jsonify({'message': 'Mật khẩu hoặc email không chính xác'})
    return render_template('dangnhap.html')


@app.route('/quenmatkhau', methods=['GET', 'POST'])
def quenmatkhau():
    if request.method == 'POST':
        email = request.form.get('email')
        if kiem_tra_email(email):
            token = lay_token(email)
            link = f'/{token}'
            gui_email(email, link)  # Chưa xong, chưa làm được link token để điền mật khẩu mới
    return render_template('quenmatkhau.html')


@app.route('/detai', methods=['GET', 'POST'])
def detai():
    if 'user_id' in session:
        if request.method == 'POST':
            dt = request.get_json()
            data = dt['data']
            action = dt['action']
            if action == '':
                email = data['email']
                if email:
                    user_id = lay_ten_id(email)['user_id']
                    detaiList = lay_de_tai(user_id)
                    return jsonify(detaiList=detaiList)
            elif action == 'luu':
                if 'detai_id' not in data:
                    data['token'] = str(uuid.uuid4())
                luu_de_tai(data)
                detaiList = lay_de_tai(data['user_id'])
                return jsonify(detaiList=detaiList)
            elif action == 'xoa':
                xoa_de_tai(data)
                detaiList = lay_de_tai(data['user_id'])
                return jsonify(detaiList=detaiList)
        return render_template('detai.html')
    return redirect(url_for('dangnhap'))


@app.route('/taocauhoi', methods=['GET', 'POST'])
def taocauhoi():
    if 'user_id' in session:
        if request.method == 'POST':
            dt = request.get_json()
            data = dt['data']
            action = dt['action']
            if action == 'chondetai':
                detai_id = data['detai_id']
                data['nhomcauhoi_id'] = 'Chọn'
                cauhoiList = lay_cau_hoi(data, '')
                nhomcauhoiList = lay_nhom_cau_hoi(detai_id)
                if 'user_id' in data:
                    detaiList = lay_de_tai(data['user_id'])
                    return jsonify(nhomcauhoiList=nhomcauhoiList, detaiList=detaiList)
                return jsonify(nhomcauhoiList=nhomcauhoiList, cauhoiList=cauhoiList)
            elif action == 'lưu nhóm câu hỏi':
                luu_nhom_cau_hoi(data)
                detai_id = data['detai_id'].replace('"', '')
                nhomcauhoiList = lay_nhom_cau_hoi(detai_id)
                return jsonify(nhomcauhoiList=nhomcauhoiList)
            elif action == "xóa nhóm câu hỏi":
                xoa_nhom_cau_hoi(data)
                detai_id = data['detai_id'].replace('"', '')
                nhomcauhoiList = lay_nhom_cau_hoi(detai_id)
                return jsonify(nhomcauhoiList=nhomcauhoiList)
            elif action == "chonnhomcauhoi":
                cauhoiList = lay_cau_hoi(data, '')  # Data gồm nhomcauhoi_id và detai_id
                traloiDict = {}
                data = {}
                for cauhoi in cauhoiList:
                    data['cauhoi_id'] = cauhoi['cauhoi_id']
                    data['loaicautraloi_id'] = cauhoi['loaicautraloi_id']
                    traloiList = lay_cau_tra_loi(data)
                    traloiDict[cauhoi['cauhoi_id']] = traloiList
                return jsonify(cauhoiList=cauhoiList, traloiDict=traloiDict)
            elif action == "lưu câu hỏi":
                luu_cau_hoi(data)
                cauhoiList = lay_cau_hoi(data, '')
                return jsonify(cauhoiList=cauhoiList)
            elif action == "lấy câu trả lời":
                traloiList = lay_cau_tra_loi(data)  # Data là cauhoi_id và loaicautraloi_id
                return jsonify(traloiList=traloiList)
            elif action == "xóa câu hỏi":
                xoa_cau_hoi(data)
                cauhoiList = lay_cau_hoi(data, '')
                return jsonify(cauhoiList=cauhoiList)
        return render_template('taocauhoi.html')
    return redirect(url_for('dangnhap'))


@app.route('/khaosat', methods=['GET', 'POST'])
def khaosat():
    if 'user_id' in session:
        return render_template('khaosat.html')
    return redirect(url_for('dangnhap'))


@app.route('/phieukhaosat', methods=['GET', 'POST'])
def khaosat_guest():
    if request.method == 'GET':
        token = request.args.get('page')
        detai = lay_de_tai_theo_token(token)[0]
        session['detai'] = detai
        return render_template('khaosat_guest.html', detai=detai)
    if request.method == 'POST':
        dt = request.get_json()
        data = dt['data']
        action = dt['action']
        if action == "chonnhomcauhoi":
            cauhoiList = lay_cau_hoi(data, 'Hiện')  # Data gồm nhomcauhoi_id và detai_id
            traloiDict = {}
            data = {}
            for cauhoi in cauhoiList:
                data['cauhoi_id'] = cauhoi['cauhoi_id']
                data['loaicautraloi_id'] = cauhoi['loaicautraloi_id']
                traloiList = lay_cau_tra_loi(data)
                traloiDict[cauhoi['cauhoi_id']] = traloiList
            return jsonify(cauhoiList=cauhoiList, traloiDict=traloiDict)
        if action == 'chondetai':
            detai_id = data['detai_id']
            data['nhomcauhoi_id'] = 'Chọn'
            cauhoiList = lay_cau_hoi(data, 'Hiện')
            nhomcauhoiList = lay_nhom_cau_hoi(detai_id)
            return jsonify(nhomcauhoiList=nhomcauhoiList, cauhoiList=cauhoiList)
        if action == "kết quả":
            luu_ket_qua(data)
        return render_template('khaosat_guest.html', detai=session['detai'])


@app.route('/phantich', methods=['GET', 'POST'])
def phantich():
    if 'user_id' in session:
        if request.method == 'POST':
            dt = request.get_json()
            data = dt['data']
            action = dt['action']
            if action == 'chondetai':
                detai_id = data['detai_id']
                session['detai_id'] = detai_id
                ketquas = lay_ket_qua(detai_id)
                loaibien = lay_loai_bien(detai_id)
                return jsonify(ketquas=ketquas, loaibien=loaibien)

            if action == 'file':
                session.pop('detai_id', None)
                filename = 'data.csv'
                with open(filename, mode='w', newline='', encoding="utf-8") as file:
                    writer = csv.writer(file)
                    for row in data:
                        writer.writerow(row)

        return render_template('phantich.html')
    return redirect(url_for('dangnhap'))


def chia_file(filename, bienlist, rows):
    indexes = []
    new_rows = []
    if len(rows) > 0:
        for bien in bienlist:
            indexes.extend([rows[0].index(col) for col in rows[0] if col == bien])
        for row in rows:
            new_row = []
            for index in indexes:
                new_row.append(row[index])
            new_rows.append(new_row)

    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        if len(new_rows) > 0:
            headers = new_rows[0]
            writer.writerow(headers)
            for i in range(1, len(new_rows)):
                writer.writerow(new_rows[i])


def xoa_bien(data, rows):
    indexes = []
    if 'bien_xoa' in data:
        for bien in data['bien_xoa']:
            indexes.extend([rows[0].index(col) for col in rows[0] if col == bien])
        for index in sorted(indexes, reverse=True):
            for row in rows:
                if len(row) > 0:
                    row.pop(index)


def viet_file(filename, rows):
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        headers = rows[0]
        writer.writerow(headers)
        for i in range(1, len(rows)):
            writer.writerow(rows[i])


@app.route('/danhgiasobo', methods=['GET', 'POST'])
def danhgiasobo():
    if 'user_id' in session:
        if request.method == 'POST':
            with open('data.csv', 'r', encoding="utf8") as file:
                reader = csv.reader(file)
                rows = list(reader)

            with open('datadoclap.csv', 'r', encoding="utf8") as file:
                reader = csv.reader(file)
                rowsdoclap = list(reader)

            with open('dataphuthuoc.csv', 'r', encoding="utf8") as file:
                reader = csv.reader(file)
                rowsphuthuoc = list(reader)

            if len(rowsdoclap) > 0 and len(rowsphuthuoc) > 0:
                tennhom = list(set([''.join(filter(str.isalpha, s)) for s in rowsdoclap[0] + rowsphuthuoc[0]]))
            else:
                tennhom = list(set([''.join(filter(str.isalpha, s)) for s in rows]))

            dt = request.get_json()
            if 'data' in dt:
                data = dt['data']
                action = dt['action']
                if action == 'phanloaibien':
                    bienmota = data['bienmota']
                    biendoclap = data['biendoclap']
                    bienphuthuoc = data['bienphuthuoc']
                    chia_file('datamota.csv', bienmota, rows)
                    chia_file('datadoclap.csv', biendoclap, rows)
                    chia_file('dataphuthuoc.csv', bienphuthuoc, rows)

                if action == 'nhomcauhoi':
                    rows = []
                    for i in range(len(rowsphuthuoc)):
                        rows.append(rowsdoclap[i] + rowsphuthuoc[i])
                    xoa_bien(data, rows)
                    xoa_bien(data, rowsphuthuoc)
                    xoa_bien(data, rowsdoclap)
                    nhomcauhoi = data['nhomcauhoi']
                    dataDict = [{key: int(value) for key, value in zip(rows[0], sublist) if value != ''} for sublist in
                                rows[1:]]
                    cronbach_result = cronbach(dataDict, nhomcauhoi)
                    cronbach_total = cronbach_result[0][0]
                    cronbach_table = cronbach_result[1]
                    soluongbien = cronbach_result[2]

                    dataDict = [{key: int(value) for key, value in zip(rowsdoclap[0], sublist) if value != ''} for
                                sublist in
                                rowsdoclap[1:]]
                    if 'loaibien' in data:
                        if data['loaibien'] == 'bienphuthuoc':
                            if len(rowsphuthuoc[0]) < 2:
                                return jsonify({'message': 'Chưa chọn biến phụ thuộc. Vui lòng quay lại trang Phân tích để chọn biến.'})
                            dataDict = [{key: int(value) for key, value in zip(rowsphuthuoc[0], sublist) if value != ''}
                                        for sublist in
                                        rowsphuthuoc[1:]]
                    efa_result = efa(dataDict)
                    p_value = efa_result['p_value']
                    kmo = efa_result['kmo']
                    ev = efa_result['ev']
                    binhphuong = efa_result['binhphuong']
                    tile = efa_result['tile']
                    tichluy = efa_result['tichluy']
                    comau = efa_result['comau']
                    if 'matran' in efa_result:
                        matran = efa_result['matran']
                        return jsonify(tennhom=tennhom, cronbach_table=cronbach_table, cronbach_total=cronbach_total,
                                       soluongbien=soluongbien, p_value=p_value, kmo=kmo, ev=ev,
                                       binhphuong=binhphuong, tile=tile, tichluy=tichluy, matran=matran, comau=comau)
                    return jsonify(tennhom=tennhom, cronbach_table=cronbach_table, cronbach_total=cronbach_total,
                                   soluongbien=soluongbien, p_value=p_value, kmo=kmo, ev=ev,
                                   binhphuong=binhphuong, tile=tile, tichluy=tichluy, comau=comau)
                if action == 'xoabien':
                    xoa_bien(data, rows)
                    xoa_bien(data, rowsphuthuoc)
                    xoa_bien(data, rowsdoclap)
                    viet_file('data.csv', rows)
                    viet_file('datadoclap.csv', rowsdoclap)
                    viet_file('dataphuthuoc.csv', rowsphuthuoc)
                    dataDict1 = [{key: int(value) for key, value in zip(rowsdoclap[0], sublist) if value != ''} for
                                 sublist in
                                 rowsdoclap[1:]]

                    efa_result1 = efa(dataDict1)
                    nhantodaidien1 = efa_result1['nhantodaidien']
                    df1 = pd.DataFrame(nhantodaidien1)
                    for c in df1.columns:
                        new_name = f'DL_{c}'
                        df1.rename(columns={c: new_name}, inplace=True)
                    if len(rowsphuthuoc[0]) > 0:
                        dataDict2 = [{key: int(value) for key, value in zip(rowsphuthuoc[0], sublist) if value != ''}
                                     for sublist in
                                     rowsphuthuoc[1:]]
                        efa_result2 = efa(dataDict2)
                        nhantodaidien2 = efa_result2['nhantodaidien']
                        df2 = pd.DataFrame(nhantodaidien2)
                        for c in df2.columns:
                            new_name = f'PT_{c}'
                            df2.rename(columns={c: new_name}, inplace=True)
                        df = pd.concat([df1, df2], axis=1)
                        nhantodaidien = []
                        for i in range(len(nhantodaidien1)):
                            row = list(nhantodaidien1[i].values()) + list(nhantodaidien2[i].values())
                            nhantodaidien.append(row)
                        df.to_csv('factor.csv', index=False)
                        tuongquan = df.corr(method='pearson').values.tolist()
                        soluongnhantodoclap = len(nhantodaidien1[0])
                        ketquathongkemota = thongkemota()
                        ketquahoiquy = hoiquy()
                        ketquakhacbiet = khacbiet()
                        return jsonify(tennhom=tennhom, nhantodaidien=nhantodaidien,
                                       soluongnhantodoclap=soluongnhantodoclap,
                                       tuongquan=tuongquan, ketquahoiquy=ketquahoiquy, ketquakhacbiet=ketquakhacbiet,
                                       ketquathongkemota=ketquathongkemota)
                    else:
                        df = df1
                        nhantodaidien = []  # Chưa xong huhuhuhu
                        for i in range(len(nhantodaidien1)):
                            row = list(nhantodaidien1[i].values())
                            nhantodaidien.append(row)
                    df.to_csv('factor.csv', index=False)
                    tuongquan = df.corr(method='pearson').values.tolist()
                    soluongnhantodoclap = len(nhantodaidien1[0])
                    ketquathongkemota = thongkemota()
                    return jsonify(tennhom=tennhom, nhantodaidien=nhantodaidien,
                                   soluongnhantodoclap=soluongnhantodoclap,
                                   tuongquan=tuongquan, ketquathongkemota=ketquathongkemota)
            return jsonify(tennhom=tennhom)
        return render_template('danhgiasobo.html')
    return redirect(url_for('dangnhap'))


@app.route('/sangloccauhoi', methods=['GET', 'POST'])
def sangloc():
    if 'user_id' in session:
        if 'detai_id' in session:
            if request.method == 'POST':
                dt = request.get_json()
                data = dt['data']
                action = dt['action']
                if action == 'chondetai':
                    detai_id = data['detai_id']
                    cauhoiList = sang_loc(detai_id)
                    return jsonify(cauhoiList=cauhoiList)
                if action == 'xoacauhoi':
                    xoa_cau_hoi(data)
                    cauhoiList = lay_cau_hoi_theo_de_tai(data['detai_id'])
                    return jsonify(cauhoiList=cauhoiList)
                if action == 'luucauhoi':
                    luu_cau_hoi_sang_loc(data)
                    cauhoiList = lay_cau_hoi_theo_de_tai(data['detai_id'])
                    return jsonify(cauhoiList=cauhoiList)
            return render_template('sangloc.html')
        return redirect(url_for('phantich'))
    return redirect(url_for('dangnhap'))


@app.route('/danhgiachinhthuc', methods=['POST', 'GET'])
def danhgiachinhthuc():
    if 'user_id' in session:
        return render_template('danhgiachinhthuc.html')
    return redirect(url_for('dangnhap'))


@app.route('/dangxuat')
def dangxuat():
    session.pop('user_id', None)
    return redirect(url_for('dangnhap'))


if __name__ == "__main__":
    app.run(debug=True)
