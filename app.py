from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from database import them_nguoi_dung, kiem_tra_email, kiem_tra_password, lay_token, lay_ten_id
from database import lay_de_tai, luu_de_tai, xoa_de_tai, lay_nhom_cau_hoi, luu_nhom_cau_hoi, xoa_nhom_cau_hoi
from database import lay_cau_hoi, luu_cau_hoi, lay_cau_tra_loi, xoa_cau_hoi, lay_de_tai_theo_token, luu_ket_qua
from database import lay_ket_qua, doi_trang_thai
from sendmail import gui_email
from phantich import cronbach, efa
import bcrypt
import uuid
import csv

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
                print(cauhoiList)
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
                print(data)
                cauhoiList = lay_cau_hoi(data, '')
                return jsonify(cauhoiList=cauhoiList)
            elif action == "lấy câu trả lời":
                print(data)
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
                ketquas = lay_ket_qua(detai_id)
                return jsonify(ketquas=ketquas)

            if action == 'file':
               filename = 'data.csv'
               with open(filename, mode='w', newline='') as file:
                   writer = csv.writer(file)
                   for row in data:
                       writer.writerow(row)
               print('done')

        return render_template('phantich.html')
    return redirect(url_for('dangnhap'))

@app.route('/danhgiasobo', methods=['GET', 'POST'])
def danhgiasobo():
    if 'user_id' in session:
        if request.method == 'POST':
            filename = 'data.csv'
            with open(filename, 'r') as file:
                reader = csv.reader(file)
                rows = list(reader)
                tennhom = list(set([''.join(filter(str.isalpha, s)) for s in rows[0]]))
            dt = request.get_json()
            if 'data' in dt:
                data = dt['data']
                action = dt['action']
                if action == 'nhomcauhoi':
                    indexes = []
                    if 'bien_xoa' in data:
                        print('hể')
                        for bien in data['bien_xoa']:
                            indexes.extend([rows[0].index(col) for col in rows[0] if col == bien])
                        for index in sorted(indexes, reverse=True):
                            for row in rows:
                                if len(row) > 0:
                                    row.pop(index)
                    nhomcauhoi = data['nhomcauhoi']
                    dataDict = [ {key: int(value) for key, value in zip(rows[0], sublist) if value != ''} for sublist in rows[1:]]
                    cronbach_result = cronbach(dataDict, nhomcauhoi)
                    cronbach_total = cronbach_result[0][0]
                    cronbach_table = cronbach_result[1]
                    soluongbien = cronbach_result[2]
                    print(dataDict)
                    efa_result = efa(dataDict)
                    p_value = efa_result['p_value']
                    kmo = efa_result['kmo']
                    ev = efa_result['ev']
                    binhphuong = efa_result['binhphuong']
                    tile = efa_result['tile']
                    tichluy = efa_result['tichluy']
                    matran = efa_result['matran']
                    comau = efa_result['comau']

                    return jsonify(tennhom=tennhom, cronbach_table=cronbach_table, cronbach_total=cronbach_total,
                                   soluongbien=soluongbien, p_value=p_value, kmo=kmo, ev=ev,
                                   binhphuong=binhphuong, tile=tile, tichluy=tichluy, matran=matran, comau=comau)

            return jsonify(tennhom=tennhom)
        return render_template('danhgiasobo.html')
    return redirect(url_for('dangnhap'))

@app.route('/sangloccauhoi', methods=['GET', 'POST'])
def sangloc():
    if 'user_id' in session:
        if request.method == 'POST':
            dt = request.get_json()
            data = dt['data']
            action = dt['action']
            if action == 'ancauhoi':
                cauhoi_id = data['cauhoi_id']
                doi_trang_thai(cauhoi_id, "Ẩn")
                data['nhomcauhoi_id'] = 'Chọn';
                cauhoiList = lay_cau_hoi(data, '')
                return jsonify(cauhoiList=cauhoiList)
            if action == 'hiencauhoi':
                cauhoi_id = data['cauhoi_id']
                doi_trang_thai(cauhoi_id, "Hiện")
                data['nhomcauhoi_id'] = 'Chọn';
                cauhoiList = lay_cau_hoi(data, '')
                return jsonify(cauhoiList=cauhoiList)
        return render_template('sangloc.html')
    return redirect(url_for('dangnhap'))


@app.route('/danhgiachinhthuc', methods=['POST', 'GET'])
def danhgiachinhthuc():
    if 'user_id' in session:
        return render_template('danhgiachinhthuc.html')
    return redirect(url_for('dangnhap'))

@app.route('/thongkemota', methods=['POST', 'GET'])
def thongkemota():
    if 'user_id' in session:
        return render_template('thongkemota.html')
    return redirect(url_for('dangnhap'))

@app.route('/dangxuat')
def dangxuat():
    session.pop('user_id', None)
    return redirect(url_for('dangnhap'))


if __name__ == "__main__":
    app.run(debug=True)

