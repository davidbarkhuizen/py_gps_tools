function ProspectiveUser() {

	var that = this;

	this.email = '';
	this.password = '';
	this.confirmPassword = '';

	this.minimumPasswordLength = 8;

	this.infoIsValid = function() {

		// EMAIL

		var emailIsValid = stringIsNotBlank(that.email);

		// PASSWORD

		var passwordsAreNotBlank = (stringIsNotBlank(that.password) && stringIsNotBlank(that.confirmPassword)); 

		var passwordsMatch = (that.password == that.confirmPassword);
		var passwordLengthIsOk = (that.password.length >= that.minimumPasswordLength);

		var passwordIsValid = (passwordsAreNotBlank && passwordsMatch && passwordLengthIsOk);

		// ---------

		var isValid = ((emailIsValid == true) && (passwordIsValid === true));

		return isValid;
	};
}