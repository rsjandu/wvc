$('#submit').click(function(){
		var formData = new FormData();
		formData.append('hostName',$('#hostName').val());
        console.log("for=mdata "+$('#hostName').val());   
		$.ajax({
		    	url: '/auth/dbEntry',
		    	type:'POST',
		    	data: formData,
		    	cache: false,
		    	contentType: false,//'multipart/form-data',r
		    	processData: false,
		    	success: function(data){
		            console.log('Data sent for db <:-> ',data);
			}
		});
	});
