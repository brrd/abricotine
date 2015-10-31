(function () {
    function changeLi (li, regex, className) {
        var html = li.innerHTML,
            regHtml = html.replace(regex, "");
        if (regHtml !== html) {
            // Replace content
            li.innerHTML = regHtml;
            // Add class
            if (li.classList) {
                li.classList.add(className);
            } else {
                li.className += " " + className;
            }
        }
        return li;
    }

    var lis = document.getElementsByTagName("li");
    for (var i=0; i<lis.length; i++) {
        changeLi(lis[i], /^\[x\]/i, "todo-checked");
        changeLi(lis[i], /^\[\]/i, "todo-unchecked");
    }
})();
