var Score = {
		
	score : 0,
	combo : 0,
	
	getScore : function(){
		return this.comma(this.score);
	},
	
	setScore : function(count){
		
		this.score  = this.score + ((this.combo + 1)*StartPreferences.UNIT_SCORE)*count;
	},
	
	getCombo : function(){
		return this.combo;
	},
	
	setCombo : function(comboDeltaTime, isComboUp){
		if(comboDeltaTime < StartPreferences.COMBO_TIME){
			if(isComboUp == true){
				this.combo++;
			}
		}
		else
		{
			this.combo = 0;
		}
		
		return this.combo;
	},
	
	comma : function(number){
	    var len, point, str;  
	       
	    number = number + "";  
	    point = number.length % 3 ;
	    len = number.length;  
	   
	    str = number.substring(0, point);  
	    while (point < len) {  
	        if (str != "") str += ",";  
	        str += number.substring(point, point + 3);  
	        point += 3;  
	    }  
	     
	    return str;
	}
};