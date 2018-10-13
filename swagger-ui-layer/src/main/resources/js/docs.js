$.views.settings.allowCode(true);
$.views.converters("getResponseModelName", function (val) {
    return getResponseModelName(val);
});

var appsTemplate = $.templates('#appsTemplate');
var apisTemplate = $.templates('#apisTemplate');
var tempBody = $.templates('#temp_body');
var tempBodyResponseModel = $.templates('#temp_body_response_model');

//获取context path
var contextPath = getContextPath();
//前置
var baseUrl = 'http://my.com';
//client auth
var clientAuthorization = 'Basic c2VydmljZTphYmMxMjM=';
//oauth2 url
var oauth2TokenUrl = baseUrl + '/ceo-oauth2/oauth/token';
//当前应用访问路径
var appPath;

function getContextPath() {
    var pathName = document.location.pathname;
    var index = pathName.substr(1).indexOf("/");
    var result = pathName.substr(0, index + 1);
    return result;
}

var $, layer, element, loginLayer;
$(function () {
    //layui init
    layui.use(['jquery', 'layer'], function () {
        $ = layui.jquery;
        layer = layui.layer;
        loadApps();
    });
});

function login() {
    clearToken();
    loginLayer = layer.open({
        type: 1,
        content: '<form class="layui-form" style="width: 200px;margin: 20px;">\n' +
            '  <div class="layui-form-item">\n' +
            '      <input type="text" id="username" name="username" required  lay-verify="required" placeholder="请输入手机号"' +
            'class="layui-input">\n' +
            '  </div>\n' +
            '  <div class="layui-form-item">\n' +
            '      <input type="password" id="password" name="password" required lay-verify="required" placeholder="请输入密码" ' +
            'class="layui-input">\n' +
            '    </div>' +
            '</form>',
        title: '请登录',
        closeBtn: 0,
        btnAlign: 'c',
        btn: ['登录'],
        yes: function (index, layero) {
            oauth2Login($('#username').val(), $('#password').val());
        }
    });
}

function oauth2Login(username, password) {
    var grant_type = 'password'
    var scope = 'server'
    $.ajax({
        url: oauth2TokenUrl,
        headers: {
            'Authorization': clientAuthorization,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'post',
        params: {username, password, grant_type, scope},
        dataType: "json",
        success: function (data) {
            layer.close(loginLayer);
            setToken(data.access_token, data.expires_in)
        }
    })
    // layer.close(loginLayer);
    // setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzkzNjkxNTUsInVzZXJfbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiaW5kZXgiXSwianRpIjoiYzgwYzBjNjItODllZS00ZDYzLWFjY2MtOGEyZjEwY2UyMmJiIiwiY2xpZW50X2lkIjoic2VydmljZSIsInNjb3BlIjpbInNlcnZlciJdfQ.6KUO96OiJ-4TZoCB3fgbQJyaXGMgAcMv8a_SmNkMXew', 100000)
    // loadApis();
}

function setToken(token, expires) {
    localStorage.setItem("token", JSON.stringify({data: token, time: new Date().getTime() + expires * 1000}));
}

function clearToken() {
    localStorage.setItem("token", null);
}

function getToken() {
    var str = localStorage.getItem("token");
    if (!str) {
        return null;
    }
    var token = JSON.parse(str);
    return token.time > new Date().getTime() ? token.data : null;
}

function loadApps() {
    $.ajax({
        url: "swagger-resources",
        dataType: "json",
        type: "get",
        async: false,
        success: function (data) {
            $('body').html(appsTemplate.render({apps:data}));
            if (!getToken()) {
                login();
            } else {
                loadApis();
            }
        }
    });
    // var data = [{
    //     "name": "ceo-config",
    //     "url": "/ceo-config/v2/api-docs",
    //     "swaggerVersion": "2.0",
    //     "location": "/ceo-config/v2/api-docs"
    // }, {
    //     "name": "ceo-admin",
    //     "url": "/ceo-admin/v2/api-docs",
    //     "swaggerVersion": "2.0",
    //     "location": "/ceo-admin/v2/api-docs"
    // }, {
    //     "name": "ceo-user",
    //     "url": "/ceo-user/v2/api-docs",
    //     "swaggerVersion": "2.0",
    //     "location": "/ceo-user/v2/api-docs"
    // }, {
    //     "name": "ceo-oauth2",
    //     "url": "/ceo-oauth2/v2/api-docs",
    //     "swaggerVersion": "2.0",
    //     "location": "/ceo-oauth2/v2/api-docs"
    // }, {
    //     "name": "ceo-gateway",
    //     "url": "/ceo-gateway/v2/api-docs",
    //     "swaggerVersion": "2.0",
    //     "location": "/ceo-gateway/v2/api-docs"
    // }, {"name": "ceo-app", "url": "/ceo-app/v2/api-docs", "swaggerVersion": "2.0", "location": "/ceo-app/v2/api-docs"}];
    // $('body').html(appsTemplate.render({apps: data}));
    // if (!getToken()) {
    //     login();
    // } else {
    //     loadApis();
    // }
}

function loadApis() {
    appPath = $('#appsSelector').val();
    $.ajax({
        url: baseUrl + appPath + "/v2/api-docs",
        // url: "http://petstore.swagger.io/v2/swagger.json?app=" + app,
        dataType: "json",
        type: "get",
        async: false,
        headers: {'Authorization': 'Bearer ' + getToken()},
        success: function (data) {
            var jsonData = eval(data);
            // jsonData = {
            //     "swagger": "2.0",
            //     "info": {
            //         "version": "0.0.1",
            //         "title": "ceo-user",
            //         "contact": {
            //             "name": "chris",
            //             "url": "https://gitee.com/chris_k",
            //             "email": "haokang207@126.com"
            //         },
            //         "license": {
            //             "name": "Apache License, Version 2.0",
            //             "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
            //         }
            //     },
            //     "host": "my.com",
            //     "basePath": "/ceo-user",
            //     "tags": [
            //         {
            //             "name": "dept-controller",
            //             "description": "Dept Controller"
            //         },
            //         {
            //             "name": "online-user-controller",
            //             "description": "Online User Controller"
            //         },
            //         {
            //             "name": "permission-controller",
            //             "description": "Permission Controller"
            //         },
            //         {
            //             "name": "role-controller",
            //             "description": "Role Controller"
            //         },
            //         {
            //             "name": "user-controller",
            //             "description": "User Controller"
            //         }
            //     ],
            //     "paths": {
            //         "/dept": {
            //             "get": {
            //                 "tags": [
            //                     "dept-controller"
            //                 ],
            //                 "summary": "query",
            //                 "operationId": "queryUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "enable",
            //                         "in": "query",
            //                         "description": "enable",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "isAsc",
            //                         "in": "query",
            //                         "description": "isAsc",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "keyword",
            //                         "in": "query",
            //                         "description": "keyword",
            //                         "required": false,
            //                         "type": "string"
            //                     },
            //                     {
            //                         "name": "limit",
            //                         "in": "query",
            //                         "description": "limit",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     },
            //                     {
            //                         "name": "page",
            //                         "in": "query",
            //                         "description": "page",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "post": {
            //                 "tags": [
            //                     "dept-controller"
            //                 ],
            //                 "summary": "add",
            //                 "operationId": "addUsingPOST",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "dept",
            //                         "description": "dept",
            //                         "required": true,
            //                         "schema": {
            //                             "$ref": "#/definitions/DeptDto"
            //                         }
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "put": {
            //                 "tags": [
            //                     "dept-controller"
            //                 ],
            //                 "summary": "update",
            //                 "operationId": "updateUsingPUT",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "dept",
            //                         "description": "dept",
            //                         "required": true,
            //                         "schema": {
            //                             "$ref": "#/definitions/DeptDto"
            //                         }
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/dept/{id}": {
            //             "get": {
            //                 "tags": [
            //                     "dept-controller"
            //                 ],
            //                 "summary": "getById",
            //                 "operationId": "getByIdUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "id",
            //                         "in": "path",
            //                         "description": "id",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/dept/{id}/{enable}": {
            //             "get": {
            //                 "tags": [
            //                     "dept-controller"
            //                 ],
            //                 "summary": "toggle",
            //                 "operationId": "toggleUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "enable",
            //                         "in": "path",
            //                         "description": "enable",
            //                         "required": true,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "id",
            //                         "in": "path",
            //                         "description": "id",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/onlineUser": {
            //             "get": {
            //                 "tags": [
            //                     "online-user-controller"
            //                 ],
            //                 "summary": "query",
            //                 "operationId": "queryUsingGET_1",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "limit",
            //                         "in": "query",
            //                         "description": "limit",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     },
            //                     {
            //                         "name": "page",
            //                         "in": "query",
            //                         "description": "page",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/onlineUser/{accessToken}": {
            //             "delete": {
            //                 "tags": [
            //                     "online-user-controller"
            //                 ],
            //                 "summary": "delete",
            //                 "operationId": "deleteUsingDELETE",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "accessToken",
            //                         "in": "path",
            //                         "description": "accessToken",
            //                         "required": true,
            //                         "type": "string"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "204": {
            //                         "description": "No Content"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/permission": {
            //             "get": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "query",
            //                 "operationId": "queryUsingGET_2",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "enable",
            //                         "in": "query",
            //                         "description": "enable",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "isAsc",
            //                         "in": "query",
            //                         "description": "isAsc",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "keyword",
            //                         "in": "query",
            //                         "description": "keyword",
            //                         "required": false,
            //                         "type": "string"
            //                     },
            //                     {
            //                         "name": "limit",
            //                         "in": "query",
            //                         "description": "limit",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     },
            //                     {
            //                         "name": "page",
            //                         "in": "query",
            //                         "description": "page",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     },
            //                     {
            //                         "name": "parentId",
            //                         "in": "query",
            //                         "description": "parentId",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "post": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "add",
            //                 "operationId": "addUsingPOST_1",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "permission",
            //                         "description": "permission",
            //                         "required": true,
            //                         "schema": {
            //                             "$ref": "#/definitions/PermissionDto"
            //                         }
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "put": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "update",
            //                 "operationId": "updateUsingPUT_1",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "permission",
            //                         "description": "permission",
            //                         "required": true,
            //                         "schema": {
            //                             "$ref": "#/definitions/PermissionDto"
            //                         }
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/permission/get/{userId}": {
            //             "get": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "getByUserId",
            //                 "operationId": "getByUserIdUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "userId",
            //                         "in": "path",
            //                         "description": "userId",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/permission/role/{roleId}": {
            //             "get": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "getByRoleId",
            //                 "operationId": "getByRoleIdUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "roleId",
            //                         "in": "path",
            //                         "description": "roleId",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "put": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "updateRolePermission",
            //                 "operationId": "updateRolePermissionUsingPUT",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "permissionIds",
            //                         "description": "permissionIds",
            //                         "required": true,
            //                         "schema": {
            //                             "type": "array",
            //                             "items": {
            //                                 "type": "integer",
            //                                 "format": "int64"
            //                             }
            //                         }
            //                     },
            //                     {
            //                         "name": "roleId",
            //                         "in": "path",
            //                         "description": "roleId",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/permission/tree": {
            //             "get": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "tree",
            //                 "operationId": "treeUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/permission/{id}": {
            //             "get": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "getById",
            //                 "operationId": "getByIdUsingGET_1",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "id",
            //                         "in": "path",
            //                         "description": "id",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "delete": {
            //                 "tags": [
            //                     "permission-controller"
            //                 ],
            //                 "summary": "delete",
            //                 "operationId": "deleteUsingDELETE_1",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "id",
            //                         "in": "path",
            //                         "description": "id",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "204": {
            //                         "description": "No Content"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/role": {
            //             "get": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "query",
            //                 "operationId": "queryUsingGET_3",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "authenticated",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "authorities[0].authority",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "string"
            //                     },
            //                     {
            //                         "name": "credentials",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     },
            //                     {
            //                         "name": "details",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     },
            //                     {
            //                         "name": "enable",
            //                         "in": "query",
            //                         "description": "enable",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "isAsc",
            //                         "in": "query",
            //                         "description": "isAsc",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "keyword",
            //                         "in": "query",
            //                         "description": "keyword",
            //                         "required": false,
            //                         "type": "string"
            //                     },
            //                     {
            //                         "name": "limit",
            //                         "in": "query",
            //                         "description": "limit",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     },
            //                     {
            //                         "name": "page",
            //                         "in": "query",
            //                         "description": "page",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     },
            //                     {
            //                         "name": "principal",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "post": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "add",
            //                 "operationId": "addUsingPOST_2",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "role",
            //                         "description": "role",
            //                         "required": true,
            //                         "schema": {
            //                             "$ref": "#/definitions/RoleDto"
            //                         }
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "put": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "update",
            //                 "operationId": "updateUsingPUT_2",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "role",
            //                         "description": "role",
            //                         "required": true,
            //                         "schema": {
            //                             "$ref": "#/definitions/RoleDto"
            //                         }
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/role/get/{userId}": {
            //             "get": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "getByUserId",
            //                 "operationId": "getByUserIdUsingGET_1",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "userId",
            //                         "in": "path",
            //                         "description": "userId",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/role/permit": {
            //             "get": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "getPermitRoleByUserId",
            //                 "operationId": "getPermitRoleByUserIdUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "authenticated",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "authorities[0].authority",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "string"
            //                     },
            //                     {
            //                         "name": "credentials",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     },
            //                     {
            //                         "name": "details",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     },
            //                     {
            //                         "name": "principal",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/role/permit/{roleId}": {
            //             "get": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "getPermitRoleByRoleId",
            //                 "operationId": "getPermitRoleByRoleIdUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "roleId",
            //                         "in": "path",
            //                         "description": "roleId",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "put": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "updatePermitRole",
            //                 "operationId": "updatePermitRoleUsingPUT",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "permitRoleIds",
            //                         "description": "permitRoleIds",
            //                         "required": true,
            //                         "schema": {
            //                             "type": "array",
            //                             "items": {
            //                                 "type": "integer",
            //                                 "format": "int64"
            //                             }
            //                         }
            //                     },
            //                     {
            //                         "name": "roleId",
            //                         "in": "path",
            //                         "description": "roleId",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/role/{id}": {
            //             "get": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "getById",
            //                 "operationId": "getByIdUsingGET_2",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "id",
            //                         "in": "path",
            //                         "description": "id",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/role/{id}/{enable}": {
            //             "get": {
            //                 "tags": [
            //                     "role-controller"
            //                 ],
            //                 "summary": "toggle",
            //                 "operationId": "toggleUsingGET_1",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "enable",
            //                         "in": "path",
            //                         "description": "enable",
            //                         "required": true,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "id",
            //                         "in": "path",
            //                         "description": "id",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/user": {
            //             "get": {
            //                 "tags": [
            //                     "user-controller"
            //                 ],
            //                 "summary": "query",
            //                 "operationId": "queryUsingGET_4",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "isAsc",
            //                         "in": "query",
            //                         "description": "isAsc",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "keyword",
            //                         "in": "query",
            //                         "description": "keyword",
            //                         "required": false,
            //                         "type": "string"
            //                     },
            //                     {
            //                         "name": "limit",
            //                         "in": "query",
            //                         "description": "limit",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     },
            //                     {
            //                         "name": "page",
            //                         "in": "query",
            //                         "description": "page",
            //                         "required": false,
            //                         "type": "integer",
            //                         "format": "int32"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "post": {
            //                 "tags": [
            //                     "user-controller"
            //                 ],
            //                 "summary": "add",
            //                 "operationId": "addUsingPOST_3",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "user",
            //                         "description": "user",
            //                         "required": true,
            //                         "schema": {
            //                             "$ref": "#/definitions/UserDto"
            //                         }
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             },
            //             "put": {
            //                 "tags": [
            //                     "user-controller"
            //                 ],
            //                 "summary": "update",
            //                 "operationId": "updateUsingPUT_3",
            //                 "consumes": [
            //                     "application/json"
            //                 ],
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "in": "body",
            //                         "name": "user",
            //                         "description": "user",
            //                         "required": true,
            //                         "schema": {
            //                             "$ref": "#/definitions/UserDto"
            //                         }
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "201": {
            //                         "description": "Created"
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/user/get/{tel}": {
            //             "get": {
            //                 "tags": [
            //                     "user-controller"
            //                 ],
            //                 "summary": "getByTel",
            //                 "operationId": "getByTelUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "tel",
            //                         "in": "path",
            //                         "description": "tel",
            //                         "required": true,
            //                         "type": "string"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/user/info": {
            //             "get": {
            //                 "tags": [
            //                     "user-controller"
            //                 ],
            //                 "summary": "info",
            //                 "operationId": "infoUsingGET",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "authenticated",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "authorities[0].authority",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "string"
            //                     },
            //                     {
            //                         "name": "credentials",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     },
            //                     {
            //                         "name": "details",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     },
            //                     {
            //                         "name": "principal",
            //                         "in": "query",
            //                         "required": false,
            //                         "type": "object"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/user/{id}": {
            //             "get": {
            //                 "tags": [
            //                     "user-controller"
            //                 ],
            //                 "summary": "getById",
            //                 "operationId": "getByIdUsingGET_3",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "id",
            //                         "in": "path",
            //                         "description": "id",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         },
            //         "/user/{id}/{enable}": {
            //             "get": {
            //                 "tags": [
            //                     "user-controller"
            //                 ],
            //                 "summary": "toggle",
            //                 "operationId": "toggleUsingGET_2",
            //                 "produces": [
            //                     "*/*"
            //                 ],
            //                 "parameters": [
            //                     {
            //                         "name": "enable",
            //                         "in": "path",
            //                         "description": "enable",
            //                         "required": true,
            //                         "type": "boolean"
            //                     },
            //                     {
            //                         "name": "id",
            //                         "in": "path",
            //                         "description": "id",
            //                         "required": true,
            //                         "type": "integer",
            //                         "format": "int64"
            //                     }
            //                 ],
            //                 "responses": {
            //                     "200": {
            //                         "description": "OK",
            //                         "schema": {
            //                             "$ref": "#/definitions/R"
            //                         }
            //                     },
            //                     "401": {
            //                         "description": "Unauthorized"
            //                     },
            //                     "403": {
            //                         "description": "Forbidden"
            //                     },
            //                     "404": {
            //                         "description": "Not Found"
            //                     }
            //                 },
            //                 "deprecated": false
            //             }
            //         }
            //     },
            //     "definitions": {
            //         "DeptDto": {
            //             "type": "object",
            //             "properties": {
            //                 "address": {
            //                     "type": "string"
            //                 },
            //                 "contact": {
            //                     "type": "string"
            //                 },
            //                 "deptId": {
            //                     "type": "integer",
            //                     "format": "int64"
            //                 },
            //                 "enable": {
            //                     "type": "boolean"
            //                 },
            //                 "name": {
            //                     "type": "string"
            //                 },
            //                 "tel": {
            //                     "type": "string"
            //                 }
            //             },
            //             "title": "DeptDto"
            //         },
            //         "PermissionDto": {
            //             "type": "object",
            //             "properties": {
            //                 "code": {
            //                     "type": "string"
            //                 },
            //                 "description": {
            //                     "type": "string"
            //                 },
            //                 "name": {
            //                     "type": "string"
            //                 },
            //                 "parentId": {
            //                     "type": "integer",
            //                     "format": "int64"
            //                 },
            //                 "permissionId": {
            //                     "type": "integer",
            //                     "format": "int64"
            //                 }
            //             },
            //             "title": "PermissionDto"
            //         },
            //         "R": {
            //             "type": "object",
            //             "properties": {
            //                 "data": {
            //                     "type": "object"
            //                 },
            //                 "msg": {
            //                     "type": "string"
            //                 },
            //                 "ret": {
            //                     "type": "integer",
            //                     "format": "int32"
            //                 },
            //                 "total": {
            //                     "type": "integer",
            //                     "format": "int32"
            //                 }
            //             },
            //             "title": "R"
            //         },
            //         "RoleDto": {
            //             "type": "object",
            //             "properties": {
            //                 "code": {
            //                     "type": "string"
            //                 },
            //                 "description": {
            //                     "type": "string"
            //                 },
            //                 "enable": {
            //                     "type": "boolean"
            //                 },
            //                 "name": {
            //                     "type": "string"
            //                 },
            //                 "roleId": {
            //                     "type": "integer",
            //                     "format": "int64"
            //                 }
            //             },
            //             "title": "RoleDto"
            //         },
            //         "UserDto": {
            //             "type": "object",
            //             "properties": {
            //                 "deptId": {
            //                     "type": "integer",
            //                     "format": "int64"
            //                 },
            //                 "email": {
            //                     "type": "string"
            //                 },
            //                 "enable": {
            //                     "type": "boolean"
            //                 },
            //                 "name": {
            //                     "type": "string"
            //                 },
            //                 "password": {
            //                     "type": "string"
            //                 },
            //                 "roleId": {
            //                     "type": "integer",
            //                     "format": "int64"
            //                 },
            //                 "tel": {
            //                     "type": "string"
            //                 },
            //                 "userId": {
            //                     "type": "integer",
            //                     "format": "int64"
            //                 }
            //             },
            //             "title": "UserDto"
            //         }
            //     }
            // };
            $('#apiTitle').html(jsonData.info.title);
            $('#apiVersion').html(jsonData.info.version);
            $("#apisContainer").html(apisTemplate.render(jsonData));
            $("[name='a_path']").click(function () {
                var path = $(this).attr("path");
                var method = $(this).attr("method");
                var operationId = $(this).attr("operationId");
                $.each(jsonData.paths[path], function (i, d) {
                    if (d.operationId === operationId) {
                        d.path = path;
                        d.method = method;
                        $("#path-body").html(tempBody.render(d));
                        var modelName = getResponseModelName(d.responses["200"]["schema"]["$ref"]);
                        renderResponseModel(jsonData, modelName);
                    }
                });
            });

            //提交测试按钮
            $("[name='btn_submit']").click(function () {
                var operationId = $(this).attr("operationId");
                var parameterJson = {};
                $("input[operationId='" + operationId + "']").each(function (index, domEle) {
                    var k = $(domEle).attr("name");
                    var v = $(domEle).val();
                    parameterJson.push({k: v});
                });
            });
            if (!element) {
                layui.use(['element'], function () {
                    element = layui.element();
                });
            } else {
                //重新渲染nav
                element.init();
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            if (xhr.status === 401) {
                login();
            }
        }
    });
}

//渲染返回参数
function renderResponseModel(jsonData, modelName) {
    if (modelName) {
        var model = jsonData.definitions[modelName];
        model.name = modelName;
        //修改有嵌套对象的type
        $.each(model.properties, function (i, v) {
            if (v.items) {
                $.each(v.items, function (j, item) {
                    model.properties[i].type = v.type + "[" + getResponseModelName(item) + "]"
                });
            }
        });

        $("#path-body-response-model").append(tempBodyResponseModel.render(model));

        //递归渲染多层对象嵌套
        $.each(model.properties, function (i, v) {
            if (v.items) {
                $.each(v.items, function (j, item) {
                    renderResponseModel(jsonData, getResponseModelName(item));
                });
            }
        });
    }
}

//获得返回模型名字
function getResponseModelName(val) {
    if (!val) {
        return null;
    }
    return val.substring(val.lastIndexOf("/") + 1, val.length);
}

//测试按钮，获取数据
function getData(operationId) {
    var path = baseUrl + appPath + $("[m_operationId='" + operationId + "']").attr("path");
    //path 参数
    $("[p_operationId='" + operationId + "'][in='path']").each(function (index, domEle) {
        var k = $(domEle).attr("name");
        var v = $(domEle).val();
        if (v) {
            path = path.replace("{" + k + "}", v);
        }
    });

    //header参数
    var headerJson = {'Authorization': 'Bearer ' + getToken()};
    $("[p_operationId='" + operationId + "'][in='header']").each(function (index, domEle) {
        var k = $(domEle).attr("name");
        var v = $(domEle).val();
        if (v) {
            headerJson[k] = v;
        }
    });

    //请求方式
    var parameterType = $("#content_type_" + operationId).val();

    //query 参数
    var parameterJson = {};
    if ("form" == parameterType) {
        $("[p_operationId='" + operationId + "'][in='query']").each(function (index, domEle) {
            var k = $(domEle).attr("name");
            var v = $(domEle).val();
            if (v) {
                parameterJson[k] = v;
            }
        });
    } else if ("json" == parameterType) {
        var str = $("#text_tp_" + operationId).val();
        try {
            parameterJson = JSON.parse(str);
        } catch (error) {
            layer.msg("" + error, {icon: 5});
            return false;
        }
    }

    //发送请求
    $.ajax({
        type: $("[m_operationId='" + operationId + "']").attr("method"),
        url: path,
        headers: headerJson,
        data: parameterJson,
        dataType: 'json',
        success: function (data) {
            var options = {
                withQuotes: true
            };
            $("#json-response").jsonViewer(data, options);
        }
    });
}


//请求类型
function changeParameterType(el) {
    var operationId = $(el).attr("operationId");
    var type = $(el).attr("type");
    $("#content_type_" + operationId).val(type);
    $(el).addClass("layui-btn-normal").removeClass("layui-btn-primary");
    if ("form" == type) {
        $("#text_tp_" + operationId).hide();
        $("#table_tp_" + operationId).show();
        $("#pt_json_" + operationId).addClass("layui-btn-primary").removeClass("layui-btn-normal");
    } else if ("json" == type) {
        $("#text_tp_" + operationId).show();
        $("#table_tp_" + operationId).hide();
        $("#pt_form_" + operationId).addClass("layui-btn-primary").removeClass("layui-btn-normal");
    }
}
