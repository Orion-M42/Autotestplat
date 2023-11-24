appURL = '/autotest/'
loginPageURL = '/autotest/login/'
loginVerifyURL = '/autotest/login/identify/'
indexURL = '/autotest/index'
loginLastURL = '/autotest/login/last/'
logoutURL = '/autotest/logout/'

function loginVerify(){
            var userObj = JSON.parse(localStorage.getItem('user'))
            var rstStatus = 0
            if(userObj == null){
                rstStatus = 4001
                alert('未登录 请点击确认跳转到登录界面')
                setTimeout(() => window.location = loginPageURL, 300)
            }
            else{
                $.ajax({
                    url: loginLastURL,
                    type: "post",
                    async: false,
                    data:{
                        userName: userObj.userName
                    },
                    success: function(rst){
                        if(rst == 200){
                            showUserName(userObj.userName)
                            rstStatus = 200
                        }
                        else{
                            rstStatus = 400
                            alert('登录已过期 请点击确认跳转到登录界面')
                            setTimeout(() => window.location = loginPageURL, 300)
                        }
                    },
                    error: function(rst){
                        rstStatus = 404
                        console.log(rst)
                        alert(rst)
                    }
                })
            }
            return rstStatus
        }

function logout(){
            var userObj = JSON.parse(localStorage.getItem('user'))
            $.ajax({
                url: logoutURL,
                type: 'POST',
                data: {
                    userName: userObj.userName
                },
                success: function(rst){
                    if(rst == 'logout'){
                        localStorage.removeItem('user')
                        window.location = loginPageURL
                    }
                    else{
                        console.log(rst)
                        alert(rst)
                    }
                },
                error: function(rst){
                    console.log("退出失败！")
                },
            })
        }

function setUser(mKey,mValue){
    var valStr = JSON.stringify(mValue)
    localStorage.setItem(mKey, valStr)
}

function showUserName(str){
    $("#userName").text(str)
}

function tableDataInit(){
    table = $('#table').DataTable({
        dom:'tp',
        pageLength: tableItemsPerPage,
        ajax: {
            url: appURL + tableURL,
            type: "POST",
            data: tableSearchDataFunction
          },
        info: false,
        lengthChange: false,
        searching: true,
        order: [[0, "desc"]],
        columns: tableColumnsData,
    });
}
function run(e,tips="运行成功,请在测试报告中查看结果"){
  fieldValues =  e.getAttribute('data-fieldvalues');
  var intervalId = setInterval(function() {
      $.ajax({
          url: appURL+getProgressURL+fieldValues+'/',
          type: 'POST',
          data: {
              suit_id: fieldValues
          },
          success: (rst) => {
              console.log(rst)
              var progressBarId = 'progressBar_' + fieldValues;
              var progressBar = document.getElementById(progressBarId);
              progressBar.value = rst.progress;
              var runTimeId = 'run_time_' + fieldValues;
              var runTime = document.getElementById(runTimeId);
              runTime.textContent = rst.run_time;
              if (progressBar.value === progressBar.max) {
                  clearInterval(intervalId);
              }
              },
          });
      }, 100);

  $.ajax({
      url: appURL + runURL+fieldValues+'/',
      type: "POST",
      aysnc: false,
      data: function(dp){
                dp.fieldValues = fieldValues
                console.log(dp.fieldValues)
            },
      success: (rst) => {
          if(rst === '200'){
              setTimeout(function() {
                console.log(tips);
                return alert(tips);
              }, 1000);
          }
          else{
              console.log(rst)
              return alert(rst)
          }
      },
      error: (rst) =>{
          console.log(rst)
          return alert(rst)
      },
  })
    console.log(fieldValues)

}
function AjaxObjectData(keyNames, inputFields){
    var ajaxObject = new Object()
    for(var i = 0; i < keyNames.length; i++){
        console.log(inputFields[i].value)
        ajaxObject[keyNames[i]] = inputFields[i].value
    }
    console.log(ajaxObject)
    return ajaxObject
}
function showAddModal(e){
    var addModal = $("#addModal")
    var inputFields = addModal.find("[name=addInput]")
    for(var i = 0; i < inputFields.length; i++){
        var temp = inputFields[i]
        if(temp.tagName == "INPUT" || temp.tagName == "TEXTAREA"){
            temp.value = ''
        }
        else if(temp.tagName == "SELECT"){
            $(temp).find("option[selected=true]").prop("selected",false)
            $(temp).find("option").eq(0).prop("selected",true)
        }
    }
    addModal.modal('show')
    window.event.stopPropagation()
}
function add(tips="添加成功"){
    var inputFields = $("[name=addInput1]")
    for(var i = 0; i < addRequiredFields.length; i++){
        if(inputFields[addRequiredFields[i]].value == ''){
            return alert("*信息为必填项！")
        }
    }
    $.ajax({
        url: appURL + addURL,
        type: "POST",
        aysnc: false,
        data: AjaxObjectData(addFieldNames,inputFields),
        success: (rst) => {
            if(rst === '200'){
                operationSelectValue('add')
                alert(tips)
                $("#addModal").modal('hide')
            }
            else{
                console.log(rst)
                return alert('rst' )
            }
        },
        error: (rst) =>{
            console.log(rst)
            return alert('rst' )
        },
    })
}
function showModModal(e){
    selectedRow = e.parentNode.parentNode
    var inputFields = $("[name=modInput]")
    for(let i = 0; i < inputFields.length; i++){
        var temp = inputFields[i]
        if(temp.tagName == "INPUT"){
            temp.value = selectedRow.children[modRowIndex[i]].innerText
            if(temp.type == "password"){
                temp.value = $(selectedRow.children[modRowIndex[i]]).find("span").attr("pdata")
            }
        }
        else if(temp.tagName == "SELECT"){
            $(temp).find("option[selected=true]").prop("selected",false)
            $(temp).find("option[value='"+ selectedRow.children[modRowIndex[i]].innerText +"']").prop("selected",true)
        }
        else if(temp.tagName == "TEXTAREA"){
            temp.value = $(selectedRow.children[modRowIndex[i]].children[0]).attr("ordata")
        }
    }
    $("#modifyModal").modal('show')
    window.event.stopPropagation()
}

function showSetModal(e){
    selectedRow = e.parentNode.parentNode
    var inputFields = $("[name=setInput]")
    for(let i = 0; i < inputFields.length; i++){
        var temp = inputFields[i]
        if(temp.tagName == "INPUT"){
            temp.value = selectedRow.children[setRowIndex[i]].innerText
            if(temp.type == "password"){
                temp.value = $(selectedRow.children[setRowIndex[i]]).find("span").attr("pdata")
            }
        }
        else if(temp.tagName == "SELECT"){
            $(temp).find("option[selected=true]").prop("selected",false)
            $(temp).find("option[value='"+ selectedRow.children[setRowIndex[i]].innerText +"']").prop("selected",true)
        }
        else if(temp.tagName == "TEXTAREA"){
            temp.value = $(selectedRow.children[setRowIndex[i]].children[0]).attr("ordata")
        }
    }
    $("#setModal").modal('show')
    window.event.stopPropagation()
}


function set(tips="设置成功"){
    var inputFields = $("[name=setInput]")
    for(var i = 0; i < setRequiredFields.length; i++){
        if(inputFields[setRequiredFields[i]].value == ''){
            return alert("*信息为必填项！")
        }
    }
    $.ajax({
        url: appURL + setURL,
        type: "POST",
        aysnc: false,
        data: AjaxObjectData(setFieldNames,inputFields),
        success: (rst) => {
            if(rst === '200'){
                operationSelectValue('set')
                alert(tips)
                $("#setModal").modal('hide')
            }
            else{
                console.log(rst)
                return alert(rst)
            }
        },
        error: (rst) => {
            console.log(rst)
            return alert(rst)
        },
    })
}


function mod(tips="修改成功"){
    var inputFields = $("[name=modInput]")
    for(var i = 0; i < modRequiredFields.length; i++){
        if(inputFields[modRequiredFields[i]].value == ''){
            return alert("*信息为必填项！")
        }
    }
    $.ajax({
        url: appURL + modURL,
        type: "POST",
        aysnc: false,
        data: AjaxObjectData(modFieldNames,inputFields),
        success: (rst) => {
            if(rst === '200'){
                operationSelectValue('modify')
                alert(tips)
                $("#modifyModal").modal('hide')
            }
            else{
                console.log(rst)
                return alert(rst)
            }
        },
        error: (rst) => {
            console.log(rst)
            return alert(rst)
        },
    })
}

function showDelModal(e){
    selectedRow = e.parentNode.parentNode
    var inputFields = $("[name=delInput]")
    for(let i = 0; i < inputFields.length; i++){
        if(inputFields[i].tagName == "INPUT"){
            inputFields[i].value = selectedRow.children[i].innerText
        }
        else if(inputFields[i].tagName == "TEXTAREA"){
            inputFields[i].value = $(selectedRow.children[i].children[0]).attr("ordata")
        }
    }
    $("#deleteModal").modal('show')
    window.event.stopPropagation()
}

function del(tips="删除成功"){
    var inputFields = $("[name=delInput]")
    $.ajax({
        url: appURL + delURL,
        type: "POST",
        aysnc: false,
        data: AjaxObjectData(delFieldNames,inputFields),
        success: (rst) => {
            if(rst === '200'){
                operationSelectValue('delete')
                alert("删除成功")
                $("#deleteModal").modal('hide')
            }
            else{
                console.log(rst)
                return alert(rst)
            }
        },
        error: (rst) => {
            console.log(rst)
            return alert(rst)
        },
    })
}

function searchClick(){
    var filter = $("[name=searchField]")
    var filterList = []
    for(let i = 0; i < filter.length; i++){
        filterList[i] = filter[i].value
    }
    sessionStorage.setItem('filter', JSON.stringify(filterList))

    table.ajax.reload(null, false)

    var storage = table
    for(let i = 0; i < filterList.length; i++){
        storage = storage.column(searchableTableColumns[i]).search(filterList[i])
    }
    storage.draw()
}

function getAndShowSearchSelectValue(){
    if(getSearchSelectURL.length == 0)
        return
    $.ajax({
        url: appURL + getSearchSelectURL,
        async: false,
        success: (rst) => {
            searchFieldsOptions = rst
            console.log(searchFieldsOptions)
        },
        error: (rst) => {
            console.log(rst)
            alert(rst)
        }
    })

    var searchFieldsSlt = $("#searchFields").find("select")
    for(let i = 0; i < searchFieldsOptions.length; i++){
        $(searchFieldsSlt[i]).empty()
        var optionNode = document.createElement('option')
        optionNode.innerText = '--请选择--'
        optionNode.value = ''
        searchFieldsSlt[i].append(optionNode)
        for(let j = 0; j < searchFieldsOptions[i].length; j++){
            var optionNode = document.createElement('option')
            optionNode.innerText = searchFieldsOptions[i][j]
            optionNode.value = searchFieldsOptions[i][j]
            searchFieldsSlt[i].append(optionNode)
        }
    }
}

function getAndShowAddSelectValue(){
    if(getAddSelectURL.length == 0)
        return
    $.ajax({
        url: appURL + getAddSelectURL,
        async: false,
        success: (rst) => {
            FieldsOptions = rst
            console.log(FieldsOptions)
        },
        error: (rst) => {
            console.log(rst)
            alert(rst)
        }
    })
    var addModalSlt = $("#addModal").find("select")
    var Slt = []
    if(addModalSlt.length > 0){
        Slt.push(addModalSlt)
    }
    for(let i = 0; i < FieldsOptions.length; i++){
        for(let j = 0; j < Slt.length; j++){
            $(Slt[j][i]).empty()
            var optionNode = document.createElement('option')
            optionNode.innerText = '--请选择--'
            optionNode.value = ''
            Slt[j][i].append(optionNode)
        }
        for(let j = 0; j < FieldsOptions[i].length; j++){
            var optionValue = FieldsOptions[i][j]
            for(let k = 0; k < Slt.length; k++){
                var optionNode = document.createElement('option')
                optionNode.innerText = optionValue
                optionNode.value = optionValue
                Slt[k][i].append(optionNode)
            }
        }
    }
}


function getAndShowSetSelectValue(){
    if(getAddSelectURL.length == 0)
        return
    $.ajax({
        url: appURL + getAddSelectURL,
        async: false,
        success: (rst) => {
            FieldsOptions = rst
            console.log(FieldsOptions)
        },
        error: (rst) => {
            console.log(rst)
            alert(rst)
        }
    })
    var setModalSlt = $("#setModal").find("select")
    var Slt = []
    if(setModalSlt.length > 0){
        Slt.push(setModalSlt)
    }
    for(let i = 0; i < FieldsOptions.length; i++){
        for(let j = 0; j < Slt.length; j++){
            $(Slt[j][i]).empty()
            var optionNode = document.createElement('option')
            optionNode.innerText = '--请选择--'
            optionNode.value = ''
            Slt[j][i].append(optionNode)
        }
        for(let j = 0; j < FieldsOptions[i].length; j++){
            var optionValue = FieldsOptions[i][j]
            for(let k = 0; k < Slt.length; k++){
                var optionNode = document.createElement('option')
                optionNode.innerText = optionValue
                optionNode.value = optionValue
                Slt[k][i].append(optionNode)
            }
        }
    }
}


function getAndShowModSelectValue(){
    if(getSelectURL.length == 0)
        return
    $.ajax({
        url: appURL + getSelectURL,
        async: false,
        success: (rst) => {
            FieldsOptions = rst
            console.log(FieldsOptions)
        },
        error: (rst) => {
            console.log(rst)
            alert(rst)
        }
    })
    var modModalSlt = $("#modifyModal").find("select")
    var Slt = []
    if(modModalSlt.length > 0){
        Slt.push(modModalSlt)
    }
    for(let i = 0; i < FieldsOptions.length; i++){
        for(let j = 0; j < Slt.length; j++){
            $(Slt[j][i]).empty()
            var optionNode = document.createElement('option')
            optionNode.innerText = '--请选择--'
            optionNode.value = ''
            Slt[j][i].append(optionNode)
        }
        for(let j = 0; j < FieldsOptions[i].length; j++){
            var optionValue = FieldsOptions[i][j]
            for(let k = 0; k < Slt.length; k++){
                var optionNode = document.createElement('option')
                optionNode.innerText = optionValue
                optionNode.value = optionValue
                Slt[k][i].append(optionNode)
            }
        }
    }
}

function getAndShowSelectValue(){
    if(getSelectURL.length == 0)
        return
    $.ajax({
        url: appURL + getSelectURL,
        async: false,
        success: (rst) => {
            FieldsOptions = rst
            console.log(FieldsOptions)
        },
        error: (rst) => {
            console.log(rst)
            alert(rst)
        }
    })
    var addModalSlt = $("#addModal").find("select")
    var modModalSlt = $("#modifyModal").find("select")
    var Slt = []
    if(addModalSlt.length > 0){
        Slt.push(addModalSlt)
    }
    if(modModalSlt.length > 0){
        Slt.push(modModalSlt)
    }
    for(let i = 0; i < FieldsOptions.length; i++){
        for(let j = 0; j < Slt.length; j++){
            $(Slt[j][i]).empty()
            var optionNode = document.createElement('option')
            optionNode.innerText = '--请选择--'
            optionNode.value = ''
            Slt[j][i].append(optionNode)
        }
        for(let j = 0; j < FieldsOptions[i].length; j++){
            var optionValue = FieldsOptions[i][j]
            for(let k = 0; k < Slt.length; k++){
                var optionNode = document.createElement('option')
                optionNode.innerText = optionValue
                optionNode.value = optionValue
                Slt[k][i].append(optionNode)
            }
        }
    }
}
function searchSelectValueUpdate(){
    var searchFields = $("#searchFields").find("[name=searchField]")
    var filterSessionObj = JSON.parse(sessionStorage.getItem("filter"))
    if(filterSessionObj != null){
        for(let i = 0; i < filterSessionObj.length; i++){
            if(filterSessionObj[i] != "" && searchFields[i].tagName == "SELECT"){
                if($(searchFields[i]).find("option[value='"+ filterSessionObj[i] +"']").length == 1){
                    $(searchFields[i]).find("option[selected=true]").prop("selected", false)
                    $(searchFields[i]).find("option[value='"+ filterSessionObj[i] +"']").prop("selected", true)
                }
                else{
                    searchClick()
                }
            }
        }
    }
}
function operationSelectValue(type = ""){
    getAndShowSearchSelectValue()
    searchSelectValueUpdate()
    additionalTips(type)
    table.ajax.reload(null, false)
}
function jumpToPage() {
    var pageInput = document.getElementById("page-input");
    var goButton = document.getElementById("go-button");
    var currentUrl = window.location.href;
    var newUrl = currentUrl.split("?")[0] + "?page=" + pageInput.value;
    window.location.href = newUrl;
}

function goBack() {
      window.location.replace(document.referrer);
    }


function checkAll(chkall) {
  let checked = chkall.checked;
  let currentPageCheckboxes = $("#blocks tbody input[type=checkbox]").filter(":visible"); // 获取当前页面的复选框元素
  currentPageCheckboxes.each(function() {
    $(this).prop('checked', checked);
  });
}

function checkPage(checkbox) {
    let currentPageCheckboxes = $("#blocks tbody input[type=checkbox]").filter(":visible").get(); // 获取当前页面的复选框元素
    let allChecked = currentPageCheckboxes.every(function(index, element) {
        return $(element).prop('checked');
    });
    $.each(currentPageCheckboxes, function() {
        console.log($(this).prop('checked'));
    });
    var cur_count = $('#blocks tbody input[type="checkbox"]').filter(":visible").length;
    var count = $('#blocks tbody input[type="checkbox"]:checked').filter(":visible").length;
    if (count==cur_count){
        allChecked = true
    }
    $('#blocks input[name="chkall"]').prop('checked', allChecked);
}

function multipleAdd(ele){
    var checkBoxList = $("#blocks tbody input[type=checkbox]")
    var rownumList =[]
    var tableList = []
    var idList = []
    var nameList =[]
    for(let i = 0; i < checkBoxList.length; i++){
        let cb = checkBoxList[i]
        if(cb.checked == true){
            rownumList.push(cb.parentNode.nextElementSibling.innerText)
            tableList.push(cb.parentNode.nextElementSibling.nextElementSibling.innerText)
            idList.push(cb.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.innerText)
            nameList.push(cb.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.innerText)
        }
    }
    if(idList.length <= 0){
        alert("当前未选中任何信息！")
        return
    }
    for (i=0;i<idList.length;i++) {
        var head_line = $(ele).parent().parent().parent().parent().parent().parent().find('h4')[0].textContent;
        var flag = head_line.substring(0, 2);
        if (flag == '添加') {
            var tmp = document.getElementsByClassName("interface_name");
        }
        else if (flag == '编辑') {
            tmp = document.getElementsByClassName("interface_name1");
        }
        var suit_interface_id = document.getElementsByClassName("suit_interface_id");
        var suit_interface_id1 = document.getElementsByClassName("suit_interface_id1");
        rownumList[i]=parseInt(rownumList[i])-1
        rownumList[i]=rownumList[i].toString()
        tmp[i].innerHTML = tableList[i] + '_' + idList[i] + '_' + nameList[i];
        add_multi_row(ele)
    }
    del_last_row(ele)
    set_no_select(ele)
}
