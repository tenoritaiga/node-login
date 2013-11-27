$(document).ready
(
	function()
	{
		$("#backgroundInput").spectrum
		(
			{
    			color: "#329E6B"
			}
		);

		$('.sp-choose').bind("click.spectrum", 
			function (e) 
			{
				var color = "" + $('#backgroundInput').spectrum("get");
                $('#container').css("background-color", color);
        	}
        );

		var clickEdit = true;
        $("#edit").click
        (
        	function()
        	{
        		if(clickEdit)
        		{
        			$('.field').removeAttr("readonly");
        			$('#hideBackground').prop("hidden", false);
        			$(this).html("Done");
        		}
        		else
        		{
        			$(this).html("Edit");
        			$('#hideBackground').prop("hidden", true);
        			$('.field').attr("readonly", true);
        		}
        		clickEdit = !clickEdit;
        	}
        );

        $('#save').click(function()
        {
        	if(validateFields())
        	{
        		adjustDatabase();
  				window.location = '../page';
  			}
  			else
  			{
  				alert("Error with input fields");
  			}
		});

		var validateFields = function()
		{
			var hasError = false;
			if(!validateUsername())
			{
				
				hasError = true;
			}
			if(!validateEmail())
			{
				hasError = true;
			}
			if(!validateHometowon())
			{
				hasError = true;
			}
			return hasError;
		};

		var adjustDatabase = function()
		{

		};
	}
);