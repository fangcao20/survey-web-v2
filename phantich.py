import pandas as pd
import psython as psy
import json
import re
import numpy as np


def cronbach(data, nhomcauhoi):
    new_data = []
    if nhomcauhoi == '':
        new_data = data
    else:
        for row in data:
            new_dict = {}
            for key in row.keys():
                if nhomcauhoi == re.findall(r'[a-zA-Z]+', key)[0]:
                    new_dict[key] = row[key]
            new_data.append(new_dict)
    print(1,new_data)
    soluongbien = len(new_data[0].keys())

    df = pd.json_normalize(new_data)
    print(df.shape[1])
    print(df.shape[0])
    df.dropna(inplace=True)
    cronbach_list = psy.cronbach_alpha_scale_if_deleted(df)
    cronbach_json = json.loads(cronbach_list[1].to_json(orient="split"))
    cronbach_dict = {'columns': ['Biến', 'Trung bình thang đo nếu loại biến', 'Phương sai thang đo nếu loại biến',
                                 'Tương quan biến tổng', "Hệ số Cronbach's Alpha nếu loại biến"]}
    i = 1
    for row in cronbach_json['data']:
        cronbach_dict[str(i)] = row
        i += 1
    cronbach_list[1] = cronbach_dict
    cronbach_list.append(soluongbien)
    return cronbach_list


def efa(data):
    from factor_analyzer import FactorAnalyzer
    from factor_analyzer.factor_analyzer import calculate_bartlett_sphericity, calculate_kmo

    df = pd.json_normalize(data)
    df.dropna(inplace=True)
    comau = df.shape[0]
    result = {}
    chi_square_value, p_value = calculate_bartlett_sphericity(df)
    kmo_all, kmo_model = calculate_kmo(df)
    result['p_value'] = p_value
    result['kmo'] = kmo_model

    fa = FactorAnalyzer()
    fa.fit(df)
    ev, v = fa.get_eigenvalues()
    new_ev = [x for x in ev if x > 1]
    num_factor = len(new_ev)
    new_ev.append(ev[len(new_ev) + 1])
    result['ev'] = new_ev

    fa = FactorAnalyzer(n_factors=num_factor, rotation='varimax')
    fa.fit(df)
    phuongsai = fa.get_factor_variance()
    result['binhphuong'] = phuongsai[0].tolist()
    result['tile'] = phuongsai[1].tolist()
    result['tichluy'] = phuongsai[2].tolist()
    matran = matranxoay(fa, df)
    result['matran'] = matran
    result['comau'] = comau
    return result


def matranxoay(fa, df):
    var = list(df.columns)
    loadings = fa.loadings_.tolist()

    for i in range(len(var)):
        loadings[i].insert(0, var[i])

    arr = np.array(loadings)
    arr = sorted(arr, key=lambda x: x[1], reverse=True)
    myarr = []
    row = 0
    for col in range(1, len(arr[0]) - 1):
        sorted_arr = myarr.copy()
        while float(arr[row][col]) > 0.5:
            sorted_arr.extend([arr[row]])
            myarr.extend([arr[row]])
            row += 1
        sorted_arr.extend(sorted(arr[row:], key=lambda x: x[col + 1], reverse=True))
        arr = sorted_arr

    result = {}
    i = 1
    for row in arr:
        result[i] = row.tolist()
        i += 1
    return result
