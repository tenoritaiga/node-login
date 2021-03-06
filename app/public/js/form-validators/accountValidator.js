
function AccountValidator(){

// build array maps of the form inputs & control groups //

	this.formFields = [$('#name-tf'), $('#email-tf'), $('#user-tf'), $('#pass-tf'), $('#pass2-tf'), $('#oldpass-tf')];
	this.controlGroups = [$('#name-cg'), $('#email-cg'), $('#user-cg'), $('#pass-cg'), $('#pass2-cg'), $('#oldpass-cg'), $('#avatar-cg')];
	
// bind the form-error modal window to this controller to display any errors //
	
	this.alert = $('.modal-form-errors');
	this.alert.modal({ show : false, keyboard : true, backdrop : true});
    var usernameRegex = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9']+)*$/;
    var passwordRegex = /^[a-zA-Z]\w{3,14}$/;
    this.validateName = function(s)
	{
        if(usernameRegex.test(s) && s.length > 4 && s.length < 14){
            //alert("True username");
            //console.log("True username");
            return true;
        }
        //alert("False username");
        //console.log("False username");
        return false;
		//return s.length >= 3;
	}
	
	this.validatePassword = function(s)
	{
	// if user is logged in and hasn't changed their password, return ok
        if(passwordRegex.test($('#pass-tf').val()))
        {
            //alert("True password");
            //console.log("True password");
            return true;
        }

        //alert("False password");
        //console.log("False password");
		return passwordRegex.test($('#pass-tf').val());

	}

    this.validatePasswordMatch = function(pass1, pass2)
    {
        return pass1 === pass2;
    }
	
	this.validateEmail = function(e)
	{
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(e);
	}
	
	this.showErrors = function(a)
	{
		$('.modal-form-errors .modal-body p').text('Please correct the following problems :');
		var ul = $('.modal-form-errors .modal-body ul');
			ul.empty();
		for (var i=0; i < a.length; i++) ul.append('<li>'+a[i]+'</li>');
		this.alert.modal('show');
	}

}

AccountValidator.prototype.showInvalidEmail = function()
{
	this.controlGroups[1].addClass('error');
	this.showErrors(['That email address is already in use.']);
}

AccountValidator.prototype.showInvalidUserName = function()
{
	this.controlGroups[2].addClass('error');
	this.showErrors(['That username is already in use.']);
}

AccountValidator.prototype.validateForm = function()
{
	var e = [];
	for (var i=0; i < this.controlGroups.length; i++) this.controlGroups[i].removeClass('error');
	if (this.validateName(this.formFields[0].val()) == false) {
		this.controlGroups[0].addClass('error'); e.push('Please Enter Your Name');
	}
	if (this.validateEmail(this.formFields[1].val()) == false) {
		this.controlGroups[1].addClass('error'); e.push('Please Enter A Valid Email');
	}
	if (this.validateName(this.formFields[2].val()) == false) {
		this.controlGroups[2].addClass('error');
		e.push('Please Choose A Username');
	}
	if (this.validatePassword(this.formFields[3].val()) == false) {
		this.controlGroups[3].addClass('error');
		e.push('Password Should Be At Least 6 Characters');
	}
    if ((this.validatePasswordMatch(this.formFields[3].val(),this.formFields[4].val())) == false) {
        this.controlGroups[4].addClass('error');
        e.push('Passwords do not match');
    }

	if (e.length) this.showErrors(e);
	return e.length === 0;
}