/*// JSFuckDecoder  v.0.9
//  
// USAGE:  output_str = new JSFuck().decode(input_str);
//
// JSFuck encoders: http://utf-8.jp/public/jsfuck.html
//                  http://swolf.0sites.org/jsfck.html
//
// Related links:   http://sla.ckers.org/forum/read.php?24,32930
//                  http://sla.ckers.org/forum/read.php?24,33349
//
// LeverOne. 12.2010 
//
//*/

JSFuck = function () {

    var null_ = /(?:^|[\[!(])((\+\[\]))(?=$|[\]+)])/g;                   //   +[] --> 0
    var false_ = /(?:^|[\[!(+])((\!\[\]))(?=$|[\]+)])/g;                 //   ![] --> false

    var grouping1_ = /(?:^|[!\[(+])(\(([^()]+)\))(?=$|[\])+])/g;         //   (+!0)+0 --> 1+0
    var grouping2_ = /(?:^|[!\[(+])(\(([^()]+)\))\([^()]*\)/g;           //   ([])() --> []()
    var grouping3_ = /(?:^|[!\[(+])(\(([^()]+)\))\[[^\[\]]*\]/g          //   ([])[]  --> [][]

    var to_string_1 = /\+(\[([\d!+'false]*)\])(?=$|[+)\]])/g;            //   1+[0] --> 1+'0'  case:  +x]  +x)   +x+  +x$  
    var to_string_2 = /(?:^|[\[(])(\[([\d!+'false]*)\])(?=\+)/g;         //   1+[0] --> 1+'0'  case:  (x+  [x+    ^x+
    var to_string_3 = /[\])]\[(\[([\d!+'false]*)\])\]/g;                 //  [][[0]] --> []['0'], ()[[0]]  --> ()['0']

    var simple_letters = /(?:^|[\[(+])(('[^']*'\[['!+\w]+\]))(?=$|[+\])])/g;    //  'false'[0] --> 'f'

    var harmless_templ_1 = /(?:^|[\[(])(((\[['\w]*\]|['\w]+)\[['+\w]+\](\[(['+cal]|['+aply])+\])*(\([^()]*\))*))(?=\+)/g;      //  [x][x](['call'|'apply'])*(x)  case:  [x+  (x+  ^x+ 
    var harmless_templ_2 = /\+(((\[['\w]*\]|['\w]+)\[['+\w]+\](\[(['+cal]|['+aply])+\])*(\([^()]*\))*))(?=$|[+\])])/g;         //  [x][x](['call'|'apply'])*(x)  case:  +x]  +x)  +x+  +x$

    var anon_letters_1 = /(?:^|[\[(])(((\[['\w]*\]|['\w]+)\[['+\w]+\]\[['+constru]+\]\([^()]*\)))(?=\+)/g;                     //  []['filter']['constructor']()  case: [x+ (x+ ^x+
    var anon_letters_2 = /\+(((\[['\w]*\]|['\w]+)\[['+\w]+\]\[['+constru]+\]\([^()]*\)))(?=$|[+\])])/g;                        //                                 case: +x+ +x) +x] +x$

    var get_window_1 = /\[[^()\[\]]*\]\[['+sort]+\]\[(['+cal]|['+aply])+\]\(\)/g;
    var get_window_2 = /\[[^()\[\]]*\]\[['+conat]+\]\[(['+cal]|['+aply])+\]\(\)\[['+!false\d]+\]/g;
    var get_window_3 = /\[[^()\[\]]*\]\[['+revs]+\]\[(['+cal]|['+aply])+\]\(\)/g;


    // further need to add valueOf , anonimous , __parent__


    var atob_letters = /((window\[['+atob]+\]\([^()\[\]]+\)(\[['+!false\d]+\])*))/g;    //  window['a'+'t'+'o'+'b']('10N')[0]

    var charcode_letters = /((['\w]+\[['+constru]+\]\[['+fromChade]+\]\(['+\d]+\)))/g; //  ''['constructor']['f'+'r'+'o'+'m'+'C'+'h'+'a'+'r'+'C'+'o'+'d'+'e']('118')

    var within_brackets = /(?:^|[\[(])([^()\[\]]+)(?=$|[\])])/g; // ['s'+'o'] --> ['so']

    var control_conversion = /^[^()]+$/; //   if input does not contain a method call   // если данные не содержат вызов метода

    var delete_primitives = function (str_) {
        str_ = str_.replace(null_, action_1);
        return str_.replace(false_, action_1);
    }

    var delete_group = function (str_) {
        while (str_.search(grouping1_) != -1 || str_.search(grouping2_) != -1 || str_.search(grouping3_) != -1) {
            str_ = str_.replace(grouping1_, action_1);
            str_ = str_.replace(grouping2_, action_1);
            str_ = str_.replace(grouping3_, action_1);
        }
        return str_;
    }

    var add_strings = function (str_) {
        while (str_.search(to_string_1) != -1 || str_.search(to_string_2) != -1 || str_.search(to_string_3) != -1) {
            str_ = str_.replace(to_string_1, action_2);
            str_ = str_.replace(to_string_2, action_2);
            str_ = str_.replace(to_string_3, action_2);
        }
        return str_;
    }

    var get_simple_ltrs = function (str_) {
        str_ = delete_group(str_);

        while (str_.search(simple_letters) != -1) {
            str_ = str_.replace(simple_letters, action_1);
            str_ = delete_group(str_);
        }
        return str_;
    }

    var check_templ = function (str_) {
        str_ = str_.replace(harmless_templ_1, action_2);
        str_ = str_.replace(harmless_templ_2, action_2);
        return str_;
    }

    var get_anon_ltrs = function (str_) {
        str_ = str_.replace(anon_letters_1, action_2);
        str_ = str_.replace(anon_letters_2, action_2);
        return str_;
    }


    var get_window = function (str_) {
        str_ = str_.replace(get_window_1, "window");
        str_ = str_.replace(get_window_2, check_window);
        str_ = str_.replace(get_window_3, "window");
        //  str_ = str_.replace(get_window_4, check_window);
        return str_;

    }


    var check_window = function (x) {
        x_ = eval(x);
        if (typeof x_ == 'object' && !(x_ instanceof Array)) x_ = "window";
        else if (typeof x_ == 'string') x_ = escape_string(x_);
        else if (typeof x_ == 'object' || typeof x_ == 'function') x_ = x;
        return x.replace(x, function () {
            return x_;
        });

    }

    var escape_string = function (str_) {

        str_ = str_.replace(/\\/g, "\\x5C");
        str_ = str_.replace(/'/g, "\\x27");
        str_ = str_.replace(/\r/g, "\\r");
        str_ = str_.replace(/\n/g, "\\n");
        str_ = str_.replace(/\[/g, "\\x5B");
        str_ = str_.replace(/\]/g, "\\x5D");
        str_ = str_.replace(/\(/g, "\\x28");
        str_ = str_.replace(/\)/g, "\\x29");
        str_ = str_.replace(/\+/g, "\\x2B");
        return "'" + str_ + "'";
    }


    var action_1 = function (x, y, z) {
        z_ = eval(z);
        if (typeof z_ == 'string') z_ = escape_string(z_);
        else if (typeof z_ == 'object' || typeof z_ == 'function') z_ = z;
        return x.replace(y, function () {
            return z_;
        });
    }

    var action_2 = function (x, y, z) {
        if (z == "") z_ = "''";
        else {
            z_ = "" + eval(z);
            z_ = escape_string(z_);
        }
        return x.replace(y, function () {
            return z_;
        });
    }



    var concat_within_brackets = function (x, y) {
        y_ = y;
        if (y.indexOf("+") != -1 && y.indexOf("'") != -1) {
            y_ = y_.replace(/\+/g, "");
            y_ = y_.replace(/'/g, "");
            y_ = "'" + y_ + "'";
        }
        return x.replace(y, function () {
            return y_;
        });
    }


    function JSFuck_Object() {

        this.decode = function (str) {

            str = str.replace(/^\s*|\s*$/g, "");

            try {
                if (str.search(/[^()\[\]+!]/) != -1) throw {
                    name: "Input error",
                    message: "Data contains extra characters. Should be only ()[]+!"
                }

                str = delete_primitives(str);
                str = add_strings(str);

                str = get_simple_ltrs(str);

                str = check_templ(str);

                str = get_anon_ltrs(str);
                str = get_window(str);
                str = get_simple_ltrs(str);

                str = str.replace(atob_letters, action_1);
                str = str.replace(charcode_letters, action_2);

                str = str.replace(within_brackets, concat_within_brackets);
                //    str = str.replace(control_conversion, function(x){return eval(x);});

            } catch (err) {
                str = err.name + ": " + err.message;
            }
            return str;

        }

    }

    return new JSFuck_Object();

}