
jQuery(function($){
  $("#westoredata>p a").click(function(e){
    e.preventDefault();
    $("#westoredata>div .more").toggle();
  });
});


/* */
window.parseMarkdown = function(item,next){
  user.asAuthority("https://api.github.com/markdown/raw",function(uri){
    jQuery.ajax({
      url:uri,
      type:'POST',
      headers: {
          'Content-Type': 'text/plain'
      },
      data:item.body
    }).done(function(data){
      item.bodyHTML = data;
    }).fail(function(response, textStatus,data) {
      if(response.status === 403){
        add403();
      }else{
        addError({name:"Bad markdown call: "+response.status, message: data.message});
      }
      item.bodyHTML = "<pre>"+item.body+"</pre>";
    }).always(function(){
      next(item);
    });
  });
}
