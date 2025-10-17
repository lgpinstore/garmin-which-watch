sub main()

    ' Create a registry object for our application's settings
    rs = CreateObject("roRegistrySection", "app_settings")
    
    ' Check if our one-time orientation setup has been done
    ' If the key doesn't exist, rs.Read() returns invalid.
    if rs.Read("orientation_set") = invalid then
        print "First run detected. Setting screen orientation to Portrait (90)..."
        
        vidmode = CreateObject("roVideoMode")
        sm = vidmode.GetScreenModes()
        
        sm[0].transform = "90"
        vidmode.SetScreenModes(sm)
        
        ' SUCCESS! Now, write the flag to the registry so this code never runs again.
        rs.Write("orientation_set", "true")
        rs.Flush() ' Save changes to persistent storage
        
        print "Orientation set. Rebooting now."
        RebootSystem()
        
    else
        ' This will be printed on every boot AFTER the first one.
        print "Orientation already configured. Skipping setup."
        
        ' --- LAUNCH YOUR MAIN APPLICATION SCRIPT FROM HERE ---
        ' For example: script "sd:/main_app.brs"
        
    end if

    print "Hello main"

    serverPort% = 8000

    app = {}
    app.msgPort = createObject("roMessagePort")

    app.server = CreateObject("roHttpServer", { port: serverPort% })
    
    if not startServer( "sd:/public", app ) then
        print "ERROR COULD NOT start server"
        return
    end if

    app.widget = startWidget( "http://localhost:" + serverPort%.toStr() + "/index.html", app )
    if invalid = app.widget then
        print "ERROR while creating HTML Widget!"
        return
    end if

    handlers = {}
    handlers["roHtmlWidgetEvent"] = function (e) : print formatJson( e.getData() ) : print : end function
    
    print "Message Loop"
    MESSAGE_LOOP:
        msg = app.msgPort.WaitMessage(0)
        print type(msg)
        
        if type( handlers[type(msg)] ) = "roFunction" then
            handlers[type(msg)]( msg )
        end if
    goto MESSAGE_LOOP

End sub


function startWidget(url,p) as object
    print "Starting Widget..."

    x = 0
    y = 0
    ' width = 1920
    ' height = 1080

    width = 1080
    height = 1920

    rect = CreateObject("roRectangle", x, y, width, height)

    ' Enable inspector
    registryWriteDifferent( "enable_web_inspector", "1", "html" )

    config = {
    url: url,
    mouse_enabled: true,
    storage_path: "/local/",
    brightsign_js_objects_enabled : false,
    inspector_server: { port: 2999 },
    port: p.msgPort
    }

    html = CreateObject("roHtmlWidget", rect, config)
    if invalid <> html then
        html.Show()
    end if

    return html
end function


function startServer( path$, p ) as boolean

    hostName$ = CreateObject("roNetworkConfiguration", 0 ).gethostname() + ".local"


    mimeTypes = []
    mimeTypes.push( {ext: ".html",  content_type:"text/html;charset=utf-8"} )
    mimeTypes.push( {ext: ".js",    content_type:"text/javascript;charset=utf-8"} )
    mimeTypes.push( {ext: ".css",   content_type:"text/css;charset=utf-8"} )
    mimeTypes.push( {ext: ".png",   content_type:"image/png"} )
    mimeTypes.push( {ext: ".otf",   content_type:"font/otf"} )
    mimeTypes.push( {ext: ".woff2", content_type:"font/woff2"} )

    mimeTypes.push( {ext: ".gif",   content_type:"image/gif"} )
    mimeTypes.push( {ext: ".jpg",   content_type:"image/jpeg"} )
    mimeTypes.push( {ext: ".json",  content_type:"application/json"} )

    for each mimeType in mimeTypes
        print mimeType.ext, mimeType.content_type
    end for
    
    if p.server.addGetFromFolder( { folder: path$, url_prefix:"/", filters: mimeTypes }) '
        print "@feeder Serving folder "; path$
    else
        print "@feeder ERROR while serving folder "; path$
        return false
    end if

    return true
end function

''''''''''''''''''''''''''''''''''
function registryWriteDifferent( key$, value$, section$ = "networking" ) as boolean
    rs = CreateObject("roRegistrySection", section$ )
        if rs.read( key$ ) = value$ then
            print "@registryWriteDifferent() NO CHANGE. "; value$
            return false
        end if
    print "@registryWriteDifferent() CHANGE REQUIRED TO REGISTRY. "; key$; " -> "; value$
    return rs.write( key$, value$ ) and rs.flush()
end function




