$('#submit').click(function() {
	var formData = {
		"hostName"     : $('#hostName').val(),
		"authType"     : $('#authType').val(),
		"clientID"     : $('#clientID').val(),
		"clientSecret" : $('#clientSecret').val(),
		"callbackURL"  : $('#callbackURL').val()
	};

	//console.log($('#hostName').val()+" "+formData.hostName);
	//console.log($('#authType').val()+" "+formData.authType);
	//console.log($('#clientID').val()+" "+formData.clientID);
	//console.log($('#clientSecret').val()+" "+formData.clientSecret);
	//console.log($('#callbackURL').val()+" "+formData.callbackURL);

	$.ajax({
		url: "/auth/dbEntry",
		type: "POST",
		dataType: "json",
		data: JSON.stringify(formData),
		contentType: "application/json",
		cache: false,
		complete: function() {
			//called when complete
			console.log('process complete');
		},

		success: function(data) {
			console.log(data);
			alert('Entry added to database successfully');
			// $('#hostName').val() = "";
		},

		error: function() {
			console.log('process error');
		},
	});
})
