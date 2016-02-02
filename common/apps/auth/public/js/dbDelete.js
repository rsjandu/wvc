$('#submit').click(function() {
	// alert('clicked')
	var formData = {
		"hostName"     : $('#hostName').val(),
		"authType"     : $('#authType').val()
	};

	//console.log($('#hostName').val()+" "+formData.hostName);
	//console.log($('#authType').val()+" "+formData.authType);

	$.ajax({
		url: "/auth/dbDelete",
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
			alert('Entry deleted from database successfully');
		},

		error: function() {
			console.log('process error');
		},
	});
})

