const autoprefixer = require("autoprefixer");
const copyWebpack = require("copy-webpack-plugin");
const fs = require("fs");
const highlight = require("highlight.js");
const htmlWebpack = require("html-webpack-plugin");
const markdownIt = require("markdown-it");
const markdownItEmoji = require("markdown-it-emoji");
const miniCssExtract = require("mini-css-extract-plugin");
const mode = require("frontmatter-markdown-loader/mode");
const path = require("path");
const sass = require("sass");
const { VueLoaderPlugin } = require("vue-loader");

const THE_CWD = process.cwd();

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  // STYLESHEET LOADERS
  // --------------------------------------------------------------------
  
  const cssLoader = {
    loader: "css-loader",
    options: {
      importLoaders: 2,
      sourceMap: false,
    },
  };
  
  const postCssLoader = {
    loader: "postcss-loader",
    options: {
      sourceMap: false,
      postcssOptions: {
        plugins: [
          autoprefixer({
            flexbox: "no-2009"
          }),
        ],
      },
    },
  };

  const sassLoader = {
    loader: "sass-loader",
    options: {
      implementation: sass,
      sourceMap: false,
      sassOptions: {
        precision: 8,
        outputStyle: "compressed",
        sourceComments: false,
        includePaths: [
          path.resolve(THE_CWD, "src", "styles"),
        ],
        quietDeps: true,
      },
    },
  };

  const styleLoader = isProduction
    ? miniCssExtract.loader 
    : "vue-style-loader";

  // CONFIG
  // --------------------------------------------------------------------

  /**
   * @type {import("webpack").Configuration}
   */
  const webpackConfig = {};

  webpackConfig.stats = {
    colors: true,
    hash: false,
    version: false,
    timings: true,
    assets: true,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errors: true,
    errorDetails: true,
    warnings: false,
    publicPath: false
  };

  webpackConfig.target = "web";
  
  webpackConfig.mode = !isProduction ? "development" : "production";

  webpackConfig.entry = {
    build: path.resolve(THE_CWD, "./src", "index.js"),
  };
  
  webpackConfig.devtool = false;
  
  webpackConfig.output = {
    pathinfo: false,
    path: path.resolve(THE_CWD, "dist"),
    filename: "[name].bundle.js",
    publicPath: "/",
    clean: true,
  };
  
  webpackConfig.module = {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: "vue-loader",
        },
      },

      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          styleLoader,
          cssLoader,
          postCssLoader,
          sassLoader,
        ],
      },

      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: {
          loader: "file-loader",
          options: {
            esModule: false,
            outputPath: "assets/fonts/",
            publicPath: "/assets/fonts",
          }
        }
      },

      {
        test: /\.(png|jpg|jpeg|gif|webp|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            esModule: false,
            outputPath: "assets/img/",
            publicPath: "/assets/img",
          }
        }
      },

      {
        test: /\.(wav|mp3|mp4|avi|mpg|mpeg|mov|ogg|webm)$/,
        use: {
          loader: "file-loader",
          options: {
            esModule: false,
            outputPath: "assets/media/",
            publicPath: "/assets/media",
          }
        }
      },

      {
        test: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/,
        use: {
          loader: "file-loader",
          options: {
            esModule: false,
            outputPath: "assets/data/",
            publicPath: "/assets/data",
          }
        }
      },

      {
        test: /\.md$/,
        use: {
          loader: "frontmatter-markdown-loader",
          options: {
            markdownIt: markdownIt({
              html: true,
              xhtmlOut: true,
              langPrefix: "language-",
              highlight: (str, lang) => {
                if (lang && highlight.getLanguage(lang)) {
                  try {
                    return (
                      `<pre class="hljs"><code>${highlight.highlight(
                        lang, 
                        str, 
                        true
                      ).value}</code></pre>`
                    );
                  } catch (__) {
                    console.log("Nothing to catch here.");
                  }
                }

                return (
                  `<pre class="hljs"><code>${markdownIt({
                    html: true,
                    xhtmlOut: true,
                    langPrefix: "language-"
                  }).utils.escapeHtml(str)}</code></pre>`
                );
              },
            }).use(markdownItEmoji),
            mode: [
              mode.VUE_COMPONENT, // This one won't work
              mode.HTML, // This one does work
              mode.META, // This one too
            ],
            vue: {
              root: "markdown-content",
            },
          },
        },
      },
    ]
  };

  webpackConfig.plugins = [
    new VueLoaderPlugin(),

    new htmlWebpack({
      inject: true,
      filename: "index.html",
      template: path.join(THE_CWD, "public", "index.html"),
      hash: true,
      minify: {
        minifyJS: true,
        minifyCSS: true,
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    new copyWebpack({
      patterns: [
        {
          from: "public",
          to: "",
          toType: "dir",
          globOptions: {
            dot: true,
            ignore: [
              "**/*.html",
            ],
          },
        }
      ],
    }),

    new miniCssExtract({
      filename: "[name].css",
    }),
  ];

  webpackConfig.devServer = {
    hot: true,
    port: 3000
  };

  webpackConfig.optimization = {
    minimize: true,
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        build: {
          name: "build",
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
        },
      },
    },
  };

  webpackConfig.resolve = {
    modules: [
      path.resolve(THE_CWD, "./src"),
      "node_modules",
    ],
    alias: {
      vue: "@vue/runtime-dom"
    }, 
    extensions: [
      ".vue",
      ".js",
      ".jsx",
      ".mjs",
      ".json",
    ],
  };

  return webpackConfig;
 };
