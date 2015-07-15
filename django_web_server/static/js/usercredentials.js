function UserCredentials() {

	var that = this;

	this.email = '';
	this.password = '';

	this.minimumPasswordLength = 8;

	this.infoIsValid = function() {

		// EMAIL

		var emailIsValid = stringIsNotBlank(that.email);

		// PASSWORD

		var passwordIsNotBlank = stringIsNotBlank(that.password); 
		var passwordLengthIsOk = (that.password.length >= that.minimumPasswordLength);
		var passwordIsValid = (passwordIsNotBlank && passwordLengthIsOk);

		// ---------

		var isValid = ((emailIsValid == true) && (passwordIsValid === true));

		return isValid;
	};
}