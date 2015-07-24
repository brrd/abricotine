# Abricotine Todo

## Pas terminé

* Le titre du pane ne devrait pas être dans la partie scrollable
* Whitelist Iframe
* Alias de commandes
* Refactoring CSS => vraiment, dont les scrollbars à harmoniser (cf atom). Peut-être que c'est pas la peine d'avoir des scrollbars custom ?
* Après le refactoring CSS, reprendre l'integration des tables pour que les lignes des tables ne soient pas retournées à la ligne (voir plus bas wrap table)
* UI : volet latéral

## Fonctionnalités prévues

* Status bar avec des infos sur le doc (ou dans le pannel) + INS (voir brackets : https://github.com/adobe/brackets/pull/6670)
* Ameliorer le toogle des mises en formes (inclure les balises quand elles sont sélectionnées)
* Coller des éléments (listes, quote...) : virer la puce si elle est déjà dans le presse papier
* Option : supprimer le retour à la ligne (tableaux par exemple). Idéalment il faudrait aussi pouvoir le faire localement pour les tableaux.
* Ajout automatique des extensions de fichier
* Permettre les images relatives
* Permettre d'enregistrer les images liés sur le disque (à priori même système que les navigateurs pour eenregistrer les pages web = dossier document_name_files)
* Popups (mais problème sous gnome)
* Fenêtres de configuration
* Export HTML : possibilité d'utiliser des templates (http://getskeleton.com/)
* Prévisu MathJax dans l'export HMTL
* Plus de langage en highlight (faire une option)
* Détecter quand le fichier a changé dans un autre éditeur et proposer reload
* Utiliser webview pour isoler le contenu du contexte de node

## Idées (pour plus tard)

* Insérer la date
* Étendre le pane aux ancres et autres ?
* Ajouter les résultats de recherche dans la toc ?
* Correcteur orthogaphique, voir : http://stackoverflow.com/questions/12343922/codemirror-with-spell-checker ou encore https://www.npmjs.com/package/codemirror-spellckecker
* Opérations sur le texte (inverser la casse, etc)
* Commentaires du document (on peut utiliser les commentaires html)
* Dark mode
* Raccourcis clavier cool (parentheses auto, déplacer line, colonne, etc)
* Revoir la recherche
* Un affichage des blocks de code plus élégant (genre avec un fond gris)
* Gestion de différents templates pour la coloration
* Utiliser Pandoc
* Notes. Problème avec les notes : ne sont pas interprétées par marked. Il vaut mieux réserver ça à plus tard, quand on sera passé à Pandoc.
* Export EPUB avec Pandoc (ne plus utiliser marked qui ne sipporte pas toutes les syntaxes) et impression PDF.
* Permettre l'insertion HTML > MD avec https://www.npmjs.com/package/to-markdown et clipboard.readHtml()
* Système de plugins (mathjax en serait un)
* Tout recoder avec Coffeescript + éventuellement un framework (?)

## Bugs

* Fix éléments blocs ex. Math (peut-être qu'on peut les preview dans une iframe comme la preview d'iframe)
* Fix: C'est ultra chiant quand on déplace une liste par copier-coller d'avoir un doublon de la puce
* Fix: Mathjax devrait couper la colorisation syntaxique (gras, italique)
* Compléter les todolists
* Fix underlinish headers (CodeMirror)
* CSS images et iframe max size
* execRoutine est encore dans commands.js ça fait des erreurs
* la preview d'image ne matche pas quand il y a des ccents dans le titre : élargir la regex
* Problème avec les racourcis quand on est sur le ch = 0 d'une ligne
* le pane peut glisser car il déborde sous le overflow (ça vient de box-sizing: border-box + padding)
* fixer une limite à la taille du pane
* Les anchors ne fonctionnent pas car les balises autofermantes n'existent pas en html5. Il faut soit changer le charset soit corriger ça au moment de la conversion.
* Le cursorSpy bug quand on a une modification (plutôt qu'un simple move du curseur)
* mathjax fiche le bazar dans les listes
* les quotations ">" ne se toggle pas correctement (notamment quand plusieurs lignes)
* electron 0.30 ajoute un raccourci clavier par défaut pour l'inspecteur webkit
* electron 0.30 utilise maintenant des fenêtres natives pour les popups, c'est mieux mais je peux focus la fenêtre derrière (en tout cas sur gnome) !! Le problème n'apparait pas avec ouvrir/fermer.
* la boîte de recherche est vraiment mauvaise. CM 5.5v a un peu amélioré ça : http://codemirror.net/doc/releases.html à voir
* corriger l'indentation qui fait soit des tabs soit des spaces et ne fait pas le même nombre selon que du texte est sélectionné ou pas.

## Notes

### Modal

Je voulais introduire la fonction suivante pour gérer des modales.

```javascript
	modal: function (win, doc) {
            // NOTE: Bug on linux https://github.com/atom/electron/issues/953
            var BrowserWindow = remote.require('browser-window');
            var parent = win;
            var modal = new BrowserWindow({
                width: 600,
                height: 400,
                resizable: false,
                center: true,
                show: false,
                "always-on-top": true,
                "skip-taskbar": true,
                title: "Modal test"
            });
            modal.setMenuBarVisibility(false);
            modal.loadUrl('https://github.com');
            modal.show();
            var forceFocus = function () {
                modal.focus();
                console.log(BrowserWindow.getFocusedWindow().getTitle());
                modal.flashFrame(true);
                setTimeout(function () {
                    modal.flashFrame(false);
                }, 1000);
            };
            parent.on("focus", forceFocus);
            modal.on("close", function () {
                console.log("fin");
                parent.removeListener("focus", forceFocus);
            });
        }
```

Le problème est que les fenêtre sont encore très bugguées avec electron sous linux. Il faut donc trouver une autre solution, genre ouvrir un onglet spécifique et cacher le menu pour éviter les interférences.

### Wrap line table

Comment faire pour éviter les retours à la ligne quand tableau ?

Une idée que je ne pousse pas jusqu'au bout car il faudrait revoir toute la CSS avant :

1) Pour chaque passage qui a changé dans le texte, tester si c'est une tableau (avec celldown.js). Si c'est un tableau, ajouter une classe à la ligne.

J'ai simulé ce comportement pour des tests dans `commands.js` :

```javascript
	test: function (win, doc, parameters) {
            doc.editor.cm.doc.eachLine( function (line) {
                if (line && /\|/.test(line.text)) {
                    doc.editor.cm.doc.addLineClass(line, "wrap", "test-class");
                }
            });
        }
```

2) Styles de la classe en question :

```css
.CodeMirror-code .test-class pre {
    white-space: pre;
    word-wrap: normal;
}
```

J'ai encore des blemes avec les fins de lignes qui ne sont pas affichées (marge négative ?). Le seul fix (vraiment crade) que j'ai trouvé est :

```css
.CodeMirror-code .test-class pre > span {
    padding-left: 100px;
}
```

Il faudrait revoir toute la CSS de toutes façons.

3) Pour adapter le comportement de la touche "End", dans `AbrEditor.js` :

```javascript
    CodeMirror.commands.goLineRightOrEnd = function (cm) {
        var lineNumber = cm.doc.getCursor().line,
            info = cm.lineInfo(lineNumber);

        if (info && typeof info.wrapClass === "string" && info.wrapClass.indexOf('test-class') !== -1) {
            cm.execCommand("goLineEnd");
        } else {
            cm.execCommand("goLineRight");
        }
    };

    var that = this,
        options= {
            lineNumbers: false,
            lineWrapping: true,
            styleActiveLine: true, // Focusmode
            autofocus: true,
            // scrollbarStyle: "overlay",
            mode: "abricotine",
            extraKeys: {
                "Enter": "newlineAndIndentContinueMarkdownList",
                "Home": "goLineLeft",
                "End": "goLineRightOrEnd"
            }
        };
```

Problèmes :

* CSS : on ne voit pas les fin de ligne
* Scroll lors de l'édition/move du curseur : le scroll n'est pas complet, de sorte qu'on ne voit pas toujours bien le curseur. C'est peut-être dû au fait que CM n'ai pas enregistré la bonne position du curseur...
* Comportements qui semblent parfois vraiment bizarres, mais il faudrait déjà débugger les deux premiers points pour vérifier ça.
