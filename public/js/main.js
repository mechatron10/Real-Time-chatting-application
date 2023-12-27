(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);


 
				  function getCookie(name) {
					let matches = document.cookie.match(new RegExp(
						"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
					));
					return matches ? decodeURIComponent(matches[1]) : undefined;
				}
				  var userData=JSON.parse(getCookie('user'));
				  var sender_id=userData._id;//
				  var receiver_id;
				  var socket=io('/user-namespace',{
						  auth:{
							 token:userData._id 
						  }
					  });
					 
				  $(document).ready(function(){
					
						  $('.user-list').click(function(){
							  var userId=$(this).attr('data-id');
							  receiver_id=userId;
							  console.log("receiver_id="+receiver_id);
							  $('.start-head').hide();
							  $('.chat-section').show();
							  socket.emit('existChat',{sender_id:sender_id,receiver_id:receiver_id});
							  socket.on('loadChats',function(data){
							
								  $('#chat-container').empty();
								  var chats=data.chats; 
								  let html='';
								  for(let x=0;x<chats.length;x++)
								  {
									  let addClass='';
									  if(chats[x]['sender_id']==sender_id)
									  {
										  addclass='current-user-chat';
									  }
									  else{
										  addclass='distance-user-chat';
									  }
									 
									  html+=`<div>
									   <h5 class='`+addclass+`' id='`+chats[x]['_id']+`'><span>`+chats[x]['message']+`</span>`;
									  
									   if(chats[x]['sender_id']==sender_id)
									  {
										 html+=` <i class="fa fa-trash" aria-hidden="true" data-id='`+chats[x]['_id']+`'data-toggle="modal" data-target="#deleteChatModel"></i>
										 <i class="fa fa-edit" aria-hidden="true" data-id='${chats[x]['_id']}'data-toggle="modal" datamsg='`+chats[x]['message']+`' data-target="#updateChatModel"></i>
										 `;
									  }
									  
										  html+=`</h5>
										</div>
									   ` ;
								  }
								  $('#chat-container').append(html);
								  scrollChat();
							  });
						  });
					  });
				  
					  //update user online status
					  socket.on('user-online',function(data){
						  $('#'+data.user_id+'-status').text('Online');
						  $('#'+data.user_id+'-status').removeClass(); 
						  $('#'+data.user_id+'-status').addClass('online-status');
					  })
					  //for updating the offline status
					  socket.on('user-offline',function(data){
						  $('#'+data.user_id+'-status').text('Offline');
						  $('#'+data.user_id+'-status').removeClass();
						  $('#'+data.user_id+'-status').addClass('offline-status');
					  })
					  //saving the chat of the user in the database
					  $('#chat-form').submit(function(event)
					  {
						
						  event.preventDefault();
						  var message = $('#message').val();
						  console.log(message);
						  $.ajax({
							  url:'/save-chat',
							  type:'POST',
							  data:{sender_id:sender_id,receiver_id:receiver_id,message:message},
							  success:function(response)
							  {
									if(response.success)
									{
									  $('#message').val('');
									  let msg=response.chat.message;
					  
									   console.log("msg="+msg);
									   
									   let html=`
									   <div>
									   <h5 class="current-user-chat" id='`+response.chat._id+`'><span> 
										  ${msg}</span>
										  <i class="fa fa-trash" aria-hidden="true" data-id='${response.chat._id}'data-toggle="modal" data-target="#deleteChatModel"></i>
										  <i class="fa fa-edit" aria-hidden="true" data-id='${response.chat._id}'data-toggle="modal" datamsg='`+msg+`' data-target="#updateChatModel"></i>
									   </h5>
									 
										</div>
									   ` ;
									   $('#chat-container').append(html);
									 
									   socket.emit('emit-chat',response.chat);
									   scrollChat();
									}
									else{
									  alert(response.message);
									}
							  }
						
							  
						  });
					  });
					  socket.on('loadNewChat',function(data){
							  if(sender_id===data.receiver_id && receiver_id===data.sender_id)//hence now all the users wll not able to see the chat of the other users 
						   {
							  let html=`
									   <div>
									   <h5 class="distance-user-chat" id='${data._id}'><span>${data.message}</span></h5>
										</div>
									   ` ;
									   $('#chat-container').append(html);
									   scrollChat();
						  }
						  
					  });
					  function scrollChat()
					  {
						 
						  $('#chat-container').animate({
							  scrollTop:$('#chat-container').offset().top+$('#chat-container')[0].scrollHeight
						  },0);
					  }
				  
					  //Below code implementing the delete chat functionality
					  //Here this refers to the element that is clicked 
					  $(document).on('click','.fa-trash',function()
					  {
						   let msg=$(this).parent().text();
						   console.log(msg);
						   $('#delete-message-id').val($(this).attr('data-id'));
						   $('#delete-message').text(msg);
					  });
					  $('#delete-chat-form').submit(function(event){
						  event.preventDefault();
						  var id= $('#delete-message-id').val();
						  $.ajax({
							 url:'/delete-chat',
							 type:'POST',
							 data:{id:id},
							 success:function(response)
							 {
								 if(response.success)
								 {
									$('#'+id).remove();
									$('#deleteChatModel').modal('hide');
									socket.emit('chatDeleted',id);
								 }
								 else{
								  alert(response.message);
								 }
							 }
						  })
					  })
					  socket.on('chatMessageDeleted',function(id){
						   $('#'+id).remove();
					  })
				  
					  //For updating the chat 
					   $(document).on('click','.fa-edit',function(){
						   console.log("yes");
						  let msg=$(this).attr('datamsg');
						  console.log("msg="+msg);
						 
						   $('#update-message-id').val($(this).attr('data-id'));
						   console.log($(this).attr('data-id'));
					   });
					   $('#update-chat-form').submit(function(event){
						  event.preventDefault();
						  var id= $('#update-message-id').val();
						  var message=$('#updated-message').val();
						  console.log("Here this is message  -", message);
						  $.ajax({
							 url:'/update-chat',
							 type:'POST',
							 data:{id:id,message:message},
							 success:function(response)
							 {
								 if(response.success)
								 {
									let chat=response.chat;
									console.log("success and message="+chat);
									$('#'+id).find('span').text(chat);
									$('#updated-message').val('');
								
									$('#updateChatModel').modal('hide');
									socket.emit('chatUpdated',{id:id,chat:chat});
								 }
								 else{
								  alert(response.message);
								 }
							 }
						  })
					  })
					  socket.on('chatMessageUpdated',function(data){
						
						 $('#'+data.id).find('span').text(data.chat);
						
					  });


	//Add member 
	$(document).on('click','.addMember',function(){
		var id=$(this).attr('data-id');
        var limit=$(this).attr('data-limit');
		$('#group-id').val(id);
		$('#group-limit').val(limit);
		$.ajax({
          url:'/get-members',
		  type: 'POST',
		  data:{group_id:id},
		  success:function(res)
		  {
              if(res.success==true)
			  {
                let users=res.data;
				let html='';
				for(let i=0;i< users.length;++i)
			    {
                     html+=`
					  <tr>
					  <td>
                     <input type="checkbox" name="members[]" value="`+users[i]['_id']+`">
					  </td>
					  <td>`+users[i]['name']+`</td>
					  </tr>
					 `
				}
				$('.addMembersInTable').html(html);

			  }
			  else
			  {

			  }
		  }
		});

	})