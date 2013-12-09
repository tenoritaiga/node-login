if (top.location != location) {
    top.location.href = document.location.href ;
}
$(function(){
    $('#cp4').colorpicker().on('changeColor', function(ev){
        //bodyStyle.backgroundColor = ev.color.toHex();
        console.log("Color changed to " + ev.color.toHex());
        $.cookie("color",ev.color.toHex(), { path: '/', expires: 7 });
    });
});