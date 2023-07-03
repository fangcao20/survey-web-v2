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
    soluongbien = len(new_data[0].keys())

    df = pd.json_normalize(new_data)
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
    if len(ev) > 2:
        new_ev.append(ev[len(new_ev) + 1])
    result['ev'] = new_ev

    fa = FactorAnalyzer(n_factors=num_factor, rotation='varimax', method='principal')
    fa.fit(df)
    phuongsai = fa.get_factor_variance()
    result['binhphuong'] = phuongsai[0].tolist()
    result['tile'] = phuongsai[1].tolist()
    result['tichluy'] = phuongsai[2].tolist()
    result['comau'] = comau
    matran = matranxoay(fa, df)
    if num_factor > 1:
        result['matran'] = matran
    result['nhantodaidien'] = nhan_to_dai_dien(matran, num_factor, df)
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
    print(len(arr[0]))
    for r in arr:
        print(len(r))

    for col in range(1, len(arr[0]) - 1):
        sorted_arr = myarr.copy()
        while float(arr[row][col]) > 0.5:
            sorted_arr.extend([arr[row]])
            myarr.extend([arr[row]])
            row += 1
            if row > len(arr) - 1:
                break

        sorted_arr.extend(sorted(arr[row:], key=lambda x: x[col + 1], reverse=True))
        arr = sorted_arr

    result = {}
    i = 1
    for row in arr:
        result[i] = row.tolist()
        i += 1
    return result


def nhan_to_dai_dien(matran, factorNum, df):
    data = df.to_dict(orient='records')
    ketqua = []
    if factorNum > 1:
        nhanTo = []
        for i in range(1, factorNum + 1):
            nhan_to = []
            for k in range(1, len(matran) + 1):
                if float(matran[k][i]) > 0.5:
                    nhan_to.append(matran[k][0])
            nhanTo.append(nhan_to)
        for row in data:
            mean = {}
            for i in range(len(nhanTo)):
                sum = 0
                for nt in nhanTo[i]:
                    sum += row[nt]
                if len(nhanTo[i]) == 0:
                    mean[i + 1] = 0
                else:
                    mean[i + 1] = round(sum / len(nhanTo[i]), 3)
            ketqua.append(mean)

    else:
        for row in data:
            row = list(row.values())
            mean = {}
            sum = 0
            for i in range(len(row)):
                sum += row[i]
            mean[1] = round(sum / len(row), 3)
            ketqua.append(mean)
    return ketqua


def hoiquy():
    from statsmodels.formula.api import ols
    import statsmodels.api as sm
    from scipy.stats.mstats import zscore
    df = pd.read_csv('factor.csv')
    df.dropna(inplace=True)
    biendoclap = []
    bienphuthuoc = []
    for c in df.columns:
        if c.startswith('PT'):
            bienphuthuoc.append(c)
        else:
            biendoclap.append(c)
    X = df[biendoclap]  # Các biến độc lập
    hoiQuy = []
    for bien in bienphuthuoc:
        y = df[bien]  # Biến phụ thuộc
        # Tạo DataFrame data từ X và y
        data = pd.DataFrame({'y': y})
        data = data.join(X)
        model_formula = 'y ~ ' + ' + '.join(biendoclap)
        model = ols(formula=model_formula, data=data).fit()
        modelchuanhoa = sm.OLS(zscore(y), zscore(X)).fit()
        hoiquydict = {'r': model.rsquared, 'r_adj': model.rsquared_adj, 'f': model.fvalue, 'p': model.f_pvalue, 'coef': model.params.tolist(), 'coef-p': model.pvalues.tolist(),
                      'coef-ch': modelchuanhoa.params.tolist()}
        hoiQuy.append(hoiquydict)
    result = {'bienphuthuoc': bienphuthuoc, 'ketquahoiquy': hoiQuy}
    return result


def khacbiet():
    import researchpy as rp
    import scipy.stats as stats
    import pingouin as pg

    try:
        df1 = pd.read_csv('datamota.csv')
        df2 = pd.read_csv('factor.csv')
        khacbietbienphuthuoc = []
        for column in df2.columns:
            if column.startswith('PT'):
                df = pd.concat([df1, df2[column]], axis=1)
                df.dropna(inplace=True)
                biendoclap = {}
                for c in df1:
                    khacbietbiendoclap = {}
                    rs = rp.summary_cont(df[column].groupby(df[c]))
                    description = rs.values.tolist()
                    col_name = rs.index.tolist()
                    description.insert(0, col_name)
                    khacbietbiendoclap['description'] = description
                    values = df[c].unique().tolist()
                    subset = []
                    for v in values:
                        subset.append(df[column][df[c] == v])
                    s, p = stats.levene(*subset, center='mean')
                    khacbietbiendoclap['levene'] = {'s': s, 'p': p}
                    f, p = stats.f_oneway(*subset)
                    khacbietbiendoclap['f-oneway'] = {'f': f, 'p': p}
                    rs = pg.welch_anova(data=df, dv=column, between=c)
                    f_welch = rs['F'].values.tolist()[0]
                    p_welch = rs['p-unc'].values.tolist()[0]
                    khacbietbiendoclap['welch'] = {'f': f_welch, 'p': p_welch}
                    biendoclap[c] = khacbietbiendoclap
                khacbietbienphuthuoc.append(biendoclap)
        return khacbietbienphuthuoc
    except:
        return []


def thongkemota():
    import researchpy as rp
    df = pd.read_csv('data.csv')
    df.dropna(inplace=True)
    name = df.columns.tolist()
    count = df.count().values.tolist()
    mean = []
    std = []
    result = {}
    for c in df.columns:
        if df[c].dtype == 'object':
            mean.append('')
            std.append('')
        else:
            mean.append(df[c].mean())
            std.append(df[c].std())
        rs = rp.summary_cat(df[c])
        result_dict = {
            'Variable': rs['Variable'].values.tolist(),
            'Outcome': rs['Outcome'].values.tolist(),
            'Count': rs['Count'].values.tolist(),
            'Percent': rs['Percent'].values.tolist()
        }
        result[c] = result_dict
    return {'name': name, 'count': count, 'mean': mean, 'std': std, 'frequency': result}
