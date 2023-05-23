// đói tượng validator
function Validator (options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement .matches(selector)){
                return element.parentElement;
            } 
            element = element.parentElement;
        }
    }

    var selectorRule = {};
//  hàm thực hiện validate
    function validate(inputElement, rule ) {
        var errorMessage;
        // var errorElement = getParent(inputElement, '.form-group');
        var errorELement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        //  Lấy ra các rule của selector
        var rules = selectorRule[rule.selector];
        //  Lặp qua từng rule và kiểm tra
        
        // Nếu có lỗi thì dừng việc kiểm tra
        for ( var i = 0; i < rules.length;  ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox' :
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ":checked")
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            
            if (errorMessage) break;
        }

                 if (errorMessage) {
                      errorELement.innerText = errorMessage;
                     getParent(inputElement, options.formGroupSelector).classList.add('invalid');
                    } else {
                     errorELement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    } 

                    return !errorMessage;
    }

    // Lấy element của form cần valdate
    var formElement = document.querySelector(options.form);

    if  (formElement) {

        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;
            options.rules.forEach( function (rule){
            var inputElement = formElement.querySelector(rule.selector);
            var isValid = validate(inputElement, rule)  ;      
            if (!isValid){
                isFormValid = false;
            }           
            });            
            
            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInput = formElement.querySelectorAll('[name]');             
             
                    var formValues = Array.from(enableInput).reduce(function (values, input) {
                       switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name ="' + input.name + '"]:checked').value;                               
                                break;
                            case 'checkbox': 
                                if (!input.matches(':checked'))  {
                                    values[input.name] = '';
                                    return values;                             
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                } 

                                values[input.name].push();
                                break;

                            default: 
                                values[input.name] = input.value;
                       }
                        return values;
                       
                    },{});
                    options.onSubmit(formValues);
                } 
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }

        // Lặp qua mỗi rule và xử lý
        options.rules.forEach( function (rule){

            // Lưu lại các rules cho mỗi input 

            if (Array.isArray(selectorRule[rule.selector])) {
                selectorRule[rule.selector].push(rule.test);
            } else {
                selectorRule[rule.selector] = [rule.test];
            }
                

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {

                if (inputElement) {
                    // Xử lý trường hợp blur khỏi input
                    inputElement.onblur = function () {
                        validate(inputElement, rule)  ;                 
                    }
    
                    // Xử lý khi người dùng đang nhập input
                    inputElement.oninput = function() {
                          var errorELement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);                  
                        errorELement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                } 
            })
            
        });
    }

}

// Định nghĩa các rules
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này !!!'
        }
    }
}


Validator.isEmail = function (selector, message ) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message ||'Trường này phải là email !!!'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined  : message || `Vui lòng nhập tối thiếu ${min} ký tự !!!`
        }
    }
}
