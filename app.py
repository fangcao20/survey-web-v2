from flask import Flask, render_template, request, jsonify
from database import them_nguoi_dung, kiem_tra_email, kiem_tra_password, lay_token, lay_ten_id
from database import lay_de_tai, luu_de_tai, xoa_de_tai, lay_nhom_cau_hoi, luu_nhom_cau_hoi, xoa_nhom_cau_hoi
from database import lay_cau_hoi, luu_cau_hoi, lay_cau_tra_loi, xoa_cau_hoi
from sendmail import gui_email
import bcrypt
import uuid

app = Flask(__name__)
salt = b'$2b$12$iAwtlnI9D4gr9wcI5dCn2.'


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
            luu_de_tai(data)
            detaiList = lay_de_tai(data['user_id'])
            return jsonify(detaiList=detaiList)
        elif action == 'xoa':
            xoa_de_tai(data)
            detaiList = lay_de_tai(data['user_id'])
            return jsonify(detaiList=detaiList)

    return render_template('detai.html')


@app.route('/taocauhoi', methods=['GET', 'POST'])
def taocauhoi():
    if request.method == 'POST':
        dt = request.get_json()
        data = dt['data']
        action = dt['action']
        if action == 'chondetai':
            print(data)
            detai_id = data['detai_id']
            data['nhomcauhoi_id'] = 'Chọn'
            cauhoiList = lay_cau_hoi(data)
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
            cauhoiList = lay_cau_hoi(data)  # Data gồm nhomcauhoi_id và detai_id
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
            cauhoiList = lay_cau_hoi(data)
            return jsonify(cauhoiList=cauhoiList)
        elif action == "lấy câu trả lời":
            print(data)
            traloiList = lay_cau_tra_loi(data)  # Data là cauhoi_id và loaicautraloi_id
            return jsonify(traloiList=traloiList)
        elif action == "xóa câu hỏi":
            xoa_cau_hoi(data)
            cauhoiList = lay_cau_hoi(data)
            return jsonify(cauhoiList=cauhoiList)
    return render_template('taocauhoi.html')

@app.route('/khaosat', methods=['GET', 'POST'])
def khaosat():
    return render_template('khaosat.html')


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
